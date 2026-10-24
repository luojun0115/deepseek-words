#!/usr/bin/env node
// 论文总览刷新：仓内文稿母本 content/DeepSeek_论文列表.md → papers/ 文件夹（三个专门页面）。
// 2026-10-25 用户定案：论文总览是独立 tab，给它自己的文件夹 papers/，里面放专门的东西——
//   papers/index.md      总览：卡片墙（整卡直达 arXiv）+ 时间线 + arXiv 分主线表
//   papers/official.md   官方发布：开源周 / HF 技术笔记 / 官网 News 公告
//   papers/resources.md  解读资源：综述型解读 / 视频汇总（以后新增的大段也归这里）
// 文稿母本仍是用户唯一编辑的文件；生成器按顶级「# 」标题把正文切成三页：
//   「# B.」到「# C.」之前 → official；「# C.」到结尾 → resources；其余（时间线 + A 段）→ index。
// 独立成页后，段首的编号字母（A./B./C./D.）失去上下文，生成时统一去掉。
// 用法：node scripts/refresh-papers.mjs            # 重新生成三个页面
//       node scripts/refresh-papers.mjs --build   # 生成后顺带 npm run build
//       node scripts/refresh-papers.mjs --check   # 只对账（三个页是不是文稿的当前产物），不写盘
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL = path.resolve(__dirname, '..')

// 2026-10-09 定案：文稿就是仓库自己的源码。
// 2026-10-25 定案：母本搬进 papers/ 文件夹（papers/论文清单.md）——一个 tab 一个目录，
// 用户改目录里的文稿 → 跑本脚本渲染成三页。找不到就报错退出，**绝不回退到别处的旧副本**。
const SRC = process.env.PAPERS_SRC
  ? path.resolve(process.env.PAPERS_SRC)
  : path.join(PORTAL, 'papers', '论文清单.md')
if (!fs.existsSync(SRC)) {
  console.error(`✗ 找不到文稿母本：${SRC}\n  它就在仓库里（papers/论文清单.md）——被删了则 git checkout 取回；` +
    `临时换一份用 PAPERS_SRC=/path/to/x.md`)
  process.exit(1)
}

// 建页篇数跟 papers.json 走（加篇/重排编号后不必改这里的文案）
const np = JSON.parse(fs.readFileSync(path.join(PORTAL, 'data/papers.json'), 'utf8')).length

// 栏目导航行：当前页加粗不链接；链接写 .md 后缀，交给 VitePress 换成 base+.html（与文稿里 /vocab 同一套口径）
// 2026-10-25 用户要求：长表不能再堆在卡片墙下面（“卡片之后又一个整篇文章”），
// 时间线 + 分主线表单独成一页「论文清单」，与官方发布 / 解读资源同一排栏目。
const NAV = (cur) => {
  const it = (label, href, on) => (on ? `**${label}**` : `[${label}](${href})`)
  return ['**本栏目**：', it('📋 论文总览', '/papers/index.md', cur === 'index'), ' · ',
    it('📜 论文清单', '/papers/清单.md', cur === 'list'), ' · ',
    it('🚀 官方发布', '/papers/official.md', cur === 'official'), ' · ',
    it('🔗 解读资源', '/papers/resources.md', cur === 'resources')].join(' ')
}

const HEADS = {
  index: `---
pageClass: wide papers
title: 论文总览
---

<script setup>
import PaperIndex from '../components/PaperIndex.vue'
</script>

# 📚 DeepSeek 论文总览

DeepSeek 全系列论文的时间线、分主线清单与解读资源汇总。本站已为其中 ${np} 篇制作了词汇学习页：→ [词汇学习](/vocab) · [词汇朗读](/listen)

${NAV('index')}

<!-- 卡片墙（2026-10-25 用户要求）：32 张金句封面卡，整卡外链 arXiv 原文。
     时间线表与分主线表已拆到同目录的 清单.md（本页只留卡片，不再当整篇文章用） -->
<PaperIndex mode="arxiv" />

> 想要文字版目录？看 [📜 论文清单](/papers/清单.md)：时间线一张表 + arXiv 分主线五张表。

`,
  list: `---
pageClass: wide papers
title: 论文总览 · 论文清单
---

${NAV('list')}

`,
  official: `---
pageClass: wide papers
title: 论文总览 · 官方发布
---

${NAV('official')}

`,
  resources: `---
pageClass: wide papers
title: 论文总览 · 解读资源
---

${NAV('resources')}

`,
}

const body = fs.readFileSync(SRC, 'utf8')

// 按顶级段切分。定位串用「\n# B.」整行前缀而不是 includes('B.')，避免误伤表格里的普通文字。
const iB = body.indexOf('\n# B.')
const iC = body.indexOf('\n# C.')
if (iB < 0 || iC < 0)
  console.warn(`⚠ 文稿里没找到顶级「# B.」/「# C.」段：官方发布/解读资源两页会缺正文——先检查文稿结构再渲染`)
// 独立成页后编号字母失去上下文：段首「# A. / # B. / # C. / # D.」统一去字母
// 前置部分（时间线表）+ A 段（arXiv 分主线表）→ 论文清单页
const partList = (iB < 0 ? body : body.slice(0, iB)).replace(/^# [A-Z]\.\s*/gm, '# ')
const partOfficial = iB < 0 ? '' : body.slice(iB, iC < 0 ? undefined : iC).replace(/^# [A-Z]\.\s*/gm, '# ')
const partResources = iC < 0 ? '' : body.slice(iC).replace(/^# [A-Z]\.\s*/gm, '# ')

const OUTS = [
  ['papers/index.md', HEADS.index],
  ['papers/清单.md', HEADS.list + (partList.trim() || '> 本节暂无内容。\n')],
  ['papers/official.md', HEADS.official + (partOfficial.trim() || '> 本节暂无内容。\n')],
  ['papers/resources.md', HEADS.resources + (partResources.trim() || '> 本节暂无内容。\n')],
]

// --check：pre-push 钩子与自检用它拦「改了文稿忘渲染就 push」（跟 gen-data --check 同一套路）
if (process.argv.includes('--check')) {
  const stale = OUTS.filter(([f, want]) => fs.readFileSync(path.join(PORTAL, f), 'utf8') !== want)
  if (stale.length) {
    console.error(`✗ papers/ 下 ${stale.map(([f]) => f).join('、')} 与文稿母本 content/DeepSeek_论文列表.md 不同步（改了文稿忘渲染）` +
      `\n  跑一句 npm run papers 重新生成，再把 papers/ 一起提交`)
    process.exit(1)
  }
  console.log(`✓ refresh-papers --check：papers/ 三个页面与仓内文稿一致（${body.split('\n').length} 行正文）`)
  process.exit(0)
}

for (const [f, content] of OUTS) {
  const out = path.join(PORTAL, f)
  const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : ''
  fs.mkdirSync(path.dirname(out), { recursive: true })
  fs.writeFileSync(out, content)
  console.log(`✓ ${f} 已刷新${before && before !== content ? '（有变化）' : '（无变化）'}`)
}

// 旧位置清理：2026-10-24~25 页面曾住在 notes/papers.md（后又生成过），挪进 papers/ 后那里不该再有
const legacy = path.join(PORTAL, 'notes', 'papers.md')
if (fs.existsSync(legacy)) {
  fs.rmSync(legacy)
  console.log('✓ 已删除旧位置 notes/papers.md（页面搬进 papers/ 文件夹了）')
}

if (process.argv.includes('--build')) {
  execSync('npm run build', { cwd: PORTAL, stdio: 'inherit' })
  console.log('✓ 站点已重建（.vitepress/dist）')
}
