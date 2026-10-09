#!/usr/bin/env python3
"""从**仓内页面**重推 data/papers.json 与 data/master.json。

2026-10-09 改口径：本站是一个独立代码仓、一个静态站点，必须能只靠仓库里的东西重建。
旧版这两个 json 是从工作区另一处的中间产物 `../workdir/NN_*/words.json` 抽的（那个目录
现在都没了，旧脚本一跑就把 papers.json 写成 0 篇 —— 静默毁掉整站的坑）。
实测：从仓内 `public/study/vocab/*.html` 页面自带的 DATA 重推，与当时产出的 papers.json
**字节完全一致**（32 篇 / 16299 词次 / 3241 去重词），所以页面本身就是权威内容，
中间产物不必再进仓库。

输入（全部在仓内）：
  public/study/vocab/NN_NAME_论文词汇.html   → 篇目、词数、各档计数、全称/arXiv/年份
  public/study/listen/NN_NAME_单词听力.html  → 只做存在性校验（缺页即报错，别写半成品）
输出：
  data/papers.json   字段 num/dir/short/title/arxiv/year/words/bands/vocabPath/listenPath
  data/master.json   字段 papers/totalWords/dedupWords/firstNum/lastNum（首页与总集文案读它）

用法：
  python3 scripts/gen-data.py           # 重推并写盘（内容没变则文件不动）
  python3 scripts/gen-data.py --check   # 只跟盘上现有 json 对账，不写（pre-push/CI 用）
所有校验不过一律**先报错退出、绝不写文件**。
"""
import glob
import io
import json
import os
import re
import sys
from collections import Counter

HERE = os.path.dirname(os.path.abspath(__file__))
PORTAL = os.path.dirname(HERE)
VOCAB_DIR = os.path.join(PORTAL, 'public', 'study', 'vocab')
LISTEN_DIR = os.path.join(PORTAL, 'public', 'study', 'listen')
# 十一档链里的九个可收档 + 超纲（顺序就是 papers.json 里 bands 的键序，别随意调整）
BANDS = ["四级", "六级", "考研", "专四", "考博", "专八", "雅思", "托福", "GRE", "超纲"]
CHECK = '--check' in sys.argv

errors = []


def data_block(html):
    """切出 `const DATA = [...]` 那个数组（按括号配平、认字符串里的引号与转义）。"""
    i = html.index('const DATA')
    s = html.index('[', html.index('=', i))
    depth, j, instr, esc = 0, s, False, False
    while j < len(html):
        c = html[j]
        if instr:
            if esc:
                esc = False
            elif c == '\\':
                esc = True
            elif c == '"':
                instr = False
        else:
            if c == '"':
                instr = True
            elif c == '[':
                depth += 1
            elif c == ']':
                depth -= 1
                if depth == 0:
                    return html[s:j + 1]
        j += 1
    raise ValueError('DATA 数组没有闭合')


def ptitle_of(html):
    """词汇页页头的 <i>全称 · arXiv:xxxx · 20xx/xx/xx</i> → (title, arxiv, year)。"""
    m = re.search(r'class="ptitle"><i>(.*?)</i></div>', html, re.S)
    title, arxiv, year = '', '', ''
    if m:
        p = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        parts = [q.strip() for q in p.split('·')]
        title = parts[0] if parts else ''
        for q in parts[1:]:
            ma = re.search(r'arXiv:(\S+)', q)
            if ma:
                arxiv = ma.group(1)
            my = re.search(r'(20\d\d)', q)
            if my:
                year = my.group(1)
    return title, arxiv, year


def collect():
    pages = sorted(glob.glob(os.path.join(VOCAB_DIR, '*_论文词汇.html')))
    if not pages:
        errors.append('public/study/vocab/ 下一张词汇页都没有 —— 先跑 npm run sync 把词页同步进来')
        return [], set()
    rows, uniq = [], set()
    for vp in pages:
        name = os.path.basename(vp)[:-len('_论文词汇.html')]   # 01_DeepSeek-LLM
        num, _, short = name.partition('_')
        html = io.open(vp, encoding='utf-8').read()
        try:
            sections = json.loads(data_block(html))
        except Exception as e:                                     # noqa: BLE001
            errors.append('%s：DATA 解析失败（%s）' % (name, str(e)[:70]))
            continue
        words = [w for s in sections for w in s.get('words', [])]
        if not words:
            errors.append('%s：页面里 0 个词（模板改版了？不敢写半成品 json）' % name)
            continue
        lv = Counter(w.get('lv', '') for w in words)
        unknown = {k: v for k, v in lv.items() if k not in BANDS}
        if unknown:                                                # 漏一档就等于悄悄丢词数
            errors.append('%s：出现 BANDS 之外的档位 %s，请先把它加进 BANDS' % (name, unknown))
            continue
        if not os.path.exists(os.path.join(LISTEN_DIR, name + '_单词听力.html')):
            errors.append('%s：有词汇页但缺同名听力页（papers.json 会写出打不开的链接）' % name)
            continue
        title, arxiv, year = ptitle_of(html)
        if not title or not arxiv:
            errors.append('%s：页头 ptitle 缺全称或 arXiv 号（title=%r arxiv=%r）' % (name, title, arxiv))
            continue
        uniq.update(w['w'] for w in words)
        rows.append({
            'num': num, 'dir': name, 'short': short, 'title': title,
            'arxiv': arxiv, 'year': year, 'words': len(words),
            'bands': {b: lv.get(b, 0) for b in BANDS},
            'vocabPath': '/study/vocab/%s_论文词汇.html' % name,
            'listenPath': '/study/listen/%s_单词听力.html' % name,
        })
    rows.sort(key=lambda r: r['num'])
    return rows, uniq


rows, uniq = collect()
if errors:
    print('✗ 从仓内页面重推失败 %d 处：' % len(errors))
    for e in errors:
        print('   -', e)
    sys.exit(1)

nums = sorted(r['num'] for r in rows)
papers_json = json.dumps(rows, ensure_ascii=False, indent=2) + '\n'
master = {
    'papers': len(rows),
    'totalWords': sum(r['words'] for r in rows),
    'dedupWords': len(uniq),
    'firstNum': nums[0],
    'lastNum': nums[-1],
}
master_json = json.dumps(master, ensure_ascii=False, indent=1) + '\n'

targets = [(os.path.join(PORTAL, 'data', 'papers.json'), papers_json),
           (os.path.join(PORTAL, 'data', 'master.json'), master_json)]

if CHECK:
    stale = []
    for path, want in targets:
        have = io.open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if have != want:
            stale.append(os.path.relpath(path, PORTAL))
    if stale:
        print('✗ 盘上的 %s 与仓内页面重推的结果不一致（页面改过但 json 没跟上）' % '、'.join(stale))
        print('  跑一句 python3 scripts/gen-data.py 重推，再把 json 一起提交')
        sys.exit(1)
    print('✓ gen-data --check：papers.json（%d 篇）与 master.json（%d 词次 / %d 去重词）与仓内页面一致'
          % (master['papers'], master['totalWords'], master['dedupWords']))
    sys.exit(0)

changed = []
for path, want in targets:
    have = io.open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if have != want:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        io.open(path, 'w', encoding='utf-8').write(want)
        changed.append(os.path.relpath(path, PORTAL))

print('✓ 从 %d 张仓内词汇页重推 → %s' % (len(rows), '、'.join(changed) if changed else '盘上 json 已一致，未改动'))
print('  %d 篇 · %d 词次 · %d 去重词 · 编号 %s–%s'
      % (master['papers'], master['totalWords'], master['dedupWords'], master['firstNum'], master['lastNum']))
