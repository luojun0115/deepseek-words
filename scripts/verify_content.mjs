#!/usr/bin/env node
// 内容一致性守卫：push 前后都能跑，CI 里作为构建前置步骤。
// 管的是「自动部署最怕的那类错」——改了词表/加了篇却忘了同步页面就 push，
// Action 照样把缺页的站点发上线。这里全部从 data/*.json 与页面正文现推期望值，
// 不写死篇数、不写死总集文件名，加篇/改名都不用改本脚本。
//
// 跑法：node scripts/verify_content.mjs
// 自检用：PORTAL_DIR=/tmp/fixture node scripts/verify_content.mjs
//        源页目录默认取门户的上一级，换位置用 PAGES_ROOT 覆盖
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL = path.resolve(process.env.PORTAL_DIR || path.join(__dirname, '..'))
const SRCROOT = path.resolve(process.env.PAGES_ROOT || path.join(PORTAL, '..'))
// 指纹表里的 src 相对 PAGES_ROOT；旧版（format 1）存的是相对门户的 ../xxx，兼容读一下
const srcAbsOf = (e) => e.src.startsWith('..') ? path.resolve(PORTAL, e.src) : path.resolve(SRCROOT, e.src)
const PUB = path.join(PORTAL, 'public')
const STUDY = path.join(PUB, 'study')
const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex')

const results = []
const ok = (name, cond, extra = '') => {
  results.push({ name, pass: !!cond, extra })
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  — ' + extra : ''}`)
}
// 跳过既不算通过也不算失败：这类检查要仓库外的东西（工作区源页），CI 里本来就没有
const skip = (name, why) => {
  results.push({ name, pass: true, skipped: true, extra: why })
  console.log(`- ${name}  — ${why}`)
}
const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''
const htmlFiles = (d) => fs.existsSync(d) ? fs.readdirSync(d).filter(f => f.endsWith('.html')) : []

// 1) 期望页集合全部来自 papers.json：每篇两条路径都得在 public 下真实存在
const papers = JSON.parse(read(path.join(PORTAL, 'data/papers.json')))
const ms = JSON.parse(read(path.join(PORTAL, 'data/master.json')))
ok('data/master.json 的 papers == papers.json 条数',
  ms.papers === papers.length, `master=${ms.papers} papers.json=${papers.length}`)

const missing = []
const referenced = new Set()
for (const p of papers) {
  for (const key of ['vocabPath', 'listenPath']) {
    const rel = p[key]
    if (!rel) { missing.push(`#${p.num} ${p.short} 缺 ${key}`); continue }
    referenced.add(path.join(PUB, rel))
    if (!fs.existsSync(path.join(PUB, rel))) missing.push(`#${p.num} ${p.short} → ${rel}`)
  }
}
ok(`papers.json 全部 ${papers.length} 篇的词汇/听力页都在 public 下`,
  missing.length === 0, missing.slice(0, 4).join(' | '))

// 2) 反向：study 下不允许有「没人引用」的孤儿页（改名/删篇后残留，会被拷进 dist 上线）
const orphans = []
for (const g of ['vocab', 'listen', 'master']) {
  for (const f of htmlFiles(path.join(STUDY, g))) {
    const abs = path.join(STUDY, g, f)
    if (!referenced.has(abs) && !/\/study\/master\//.test(abs)) orphans.push(`${g}/${f}`)
  }
}
ok('study/vocab|listen 无未被 papers.json 引用的孤儿页',
  orphans.length === 0, `${orphans.length} 个：` + orphans.slice(0, 4).join(' | '))

// 3) 站根页文件数与篇数对平（漏同步最常见就是少几页，这里按目录计数二次兜底）
const nV = htmlFiles(path.join(STUDY, 'vocab')).length
const nL = htmlFiles(path.join(STUDY, 'listen')).length
ok(`词汇页/听力页数量都 == 篇数`, nV === papers.length && nL === papers.length,
  `vocab=${nV} listen=${nL} 期望=${papers.length}`)

// 4) base 逃逸：静态页里不许出现根绝对 href/src（GitHub Pages 子路径下会打到用户站）
const rootAbs = [], leakedHome = []
for (const g of ['vocab', 'listen', 'master']) {
  for (const f of htmlFiles(path.join(STUDY, g))) {
    const t = read(path.join(STUDY, g, f))
    for (const m of t.matchAll(/(?:href|src)="(\/[^"]*)"/g)) rootAbs.push(`${g}/${f} → ${m[1]}`)
    if (t.includes('/Users/')) leakedHome.push(`${g}/${f}`)   // 本机绝对路径痕迹
  }
}
ok('静态页无根绝对 href/src（不会跳出 base 子路径）',
  rootAbs.length === 0, `${rootAbs.length} 处：` + rootAbs.slice(0, 3).join(' | '))
ok('静态页无本机绝对路径痕迹（/Users/…）',
  leakedHome.length === 0, leakedHome.slice(0, 3).join(' | '))

// 5) 组件引用的总集页必须真实存在（文件名是两边契约）。
//    2026-10-09：/master 站根页已取消，三张总集页只从 PaperIndex.vue 顶部横幅进入（那里写的就是 public 相对路径）
const vueLinks = [...read(path.join(PORTAL, 'components/PaperIndex.vue')).matchAll(/study\/master\/[^'"]+\.html/g)].map(s => s[0])
const want = [...new Set(vueLinks)]
const absent = want.filter(u => !fs.existsSync(path.join(PUB, u)))
ok(`组件引用的 ${want.length} 张总集页都在`,
  want.length >= 3 && absent.length === 0, absent.join(' | ') || want.join(' '))

// 5b) 取消 /master 要取消干净：站根页不在，源码里也不许再有任何人指向 master.html
//     （data/master.json 是数据文件不在此列；只查 .html 后缀的引用）。
//     例外：check_portal.cjs 里那句 page.goto('/master.html') 是反向探针——它断言的正是 404。
const ghost = []
for (const f of ['.vitepress/config.mts', 'index.md', 'vocab.md', 'listen.md', 'papers.md', 'notes.md',
                 'components/PaperIndex.vue', 'components/HomeIntro.vue', '.vitepress/theme/custom.css',
                 'scripts/sync-pages.mjs', 'scripts/check_portal.cjs', 'scripts/shot_nav.cjs',
                 'scripts/gen-notes.mjs']) {
  if (!fs.existsSync(path.join(PORTAL, f))) continue
  const t = read(path.join(PORTAL, f))
  for (const [i, ln] of t.split('\n').entries())
    if (/master\.html|link:\s*'\/master'/.test(ln) && !/\bgoto\(/.test(ln)) ghost.push(`${f}:${i + 1}`)
}
ok('没有残留的 /master 页引用（站根页已取消）',
  ghost.length === 0 && !fs.existsSync(path.join(PORTAL, 'master.md')),
  ghost.slice(0, 4).join(' | ') || 'master.md 不在且零引用')

// 6) 副本新鲜度：public/study 下的每张页都必须是「工作区源页 同一次 sync 的产物」。
//    源页不在仓库里（vocab_pages/ listen_pages/ 汇总站_20261008/pages），CI 拿不到 → 跳过；
//    本地则逐张对 sha1，并比对源目录的文件数（新增一篇忘了同步也能抱住）
const mfRaw = read(path.join(PORTAL, '.sync-manifest.json'))
if (!mfRaw) {
  ok('仓内有 .sync-manifest.json（源页指纹）', false, '跑一次 npm run sync 生成')
} else {
  const mf = JSON.parse(mfRaw)
  const roots = Object.values(mf.files).map(e => path.dirname(srcAbsOf(e)))
  const gone = [...new Set(roots)].filter(d => !fs.existsSync(d))
  if (gone.length) {
    skip('仓内副本与工作区源页内容一致',
      `源页目录不在（CI 正常）：${gone.join(' ')} — 本地则由 pre-push 钩子跑本检查兜住`)
  } else {
    const bad = []
    for (const [rel, e] of Object.entries(mf.files)) {
      const srcAbs = srcAbsOf(e)
      if (!fs.existsSync(srcAbs)) { bad.push(`${rel}（源页已删，跑 npm run sync 把副本搬走）`); continue }
      if (sha1(fs.readFileSync(srcAbs)) !== e.sha1) bad.push(`${rel}（源页已改，副本是旧的）`)
      const destAbs = path.resolve(PORTAL, rel)
      if (!fs.existsSync(destAbs) || !fs.statSync(destAbs).size) bad.push(`${rel}（仓内副本缺失或为空）`)
    }
    // 源目录里多出来的页（指纹表里没有）= 新做了页但没同步
    const extraSrc = []
    for (const d of [...new Set(roots)]) {
      const known = new Set(Object.values(mf.files).filter(e => path.dirname(srcAbsOf(e)) === d).map(e => path.basename(e.src)))
      for (const f of htmlFiles(d)) if (!known.has(f)) extraSrc.push(`${path.basename(d)}/${f}`)
    }
    ok(`副本与工作区源页指纹一致（${Object.keys(mf.files).length} 张）`,
      bad.length === 0 && extraSrc.length === 0,
      [...bad, ...extraSrc.map(s => `${s}（源页新增，未同步）`)].slice(0, 4).join(' | ') || '无陈旧的、无漏同步的新页')
  }
}

// 7) 门禁本身也要对账：钩子源码进了仓，但 .git/hooks/ 不跟仓走。
//    新克隆没跑 npm run hooks → 整套“推前拦截”静默失效，比报错更坏，所以这里直接判失败
const GITDIR = path.join(PORTAL, '.git')
if (!fs.existsSync(GITDIR)) {
  skip('pre-push 钩子已装且与 .githooks/pre-push 一致', '无 .git 目录（CI 正常），钩子只在本地起作用')
} else {
  const want = read(path.join(PORTAL, '.githooks/pre-push'))
  const HOOK = path.join(GITDIR, 'hooks/pre-push')
  const hasHook = fs.existsSync(HOOK)
  const got = read(HOOK)
  const exe = hasHook && (fs.statSync(HOOK).mode & 0o111) !== 0
  ok('pre-push 钩子已装且与 .githooks/pre-push 一致',
    !!want && got === want && exe,
    !want ? '缺 .githooks/pre-push（源码丢了）'
      : !hasHook ? '没装：跑 npm run hooks'
        : !exe ? '装了但没可执行位（chmod +x .git/hooks/pre-push）'
          : got !== want ? '装的是旧副本：跑 npm run hooks 重装' : '已装且一致')
}

// 站点的内容层必须只读仓库里的东西（2026-10-09 定案：本站是独立代码仓，不依赖工作区兄弟目录）。
// 拿几个脚本各自的 --check 模式跑一遍——它们只读写仓内路径，能跑通就等于“仅靠仓内重建得出相同产物”；
// 实现只写在这几个脚本里，这里只调它们，不在 JS 里重抄一份生成逻辑（那必然跟Python/Node 两语言飘移）
const run = (cmd, args) => {
  try {
    return { ok: true, out: execFileSync(cmd, args, { cwd: PORTAL, encoding: 'utf8' }).trim() }
  } catch (e) {
    const miss = (e.code === 'ENOENT')
    return { ok: false, miss, out: ((e.stdout || '') + (e.stderr || '') + (e.message || '')).trim().split('\n').slice(0, 2).join(' / ') }
  }
}
for (const [name, cmd, args] of [
  ['papers.json / master.json 与仓内词汇页重推一致', 'python3', ['scripts/gen-data.py', '--check']],
  ['papers.md 与仓内文稿母本一致（改了文稿没漏渲染）', process.execPath, ['scripts/refresh-papers.mjs', '--check']],
  // 2026-10-09 新增「学习笔记」栏目：notes/ 下的 md 必须和 papers.json 的 dir 一一对应
  ['notes/ 与 papers.json 篇目一一对应（不欠不多）', process.execPath, ['scripts/gen-notes.mjs', '--check']],
]) {
  const r = run(cmd, args)
  if (r.miss) skip(name, `缺 ${cmd}（CI 或最小环境没装），本地由 pre-push 钩子兼住`)
  else ok(name, r.ok, r.out.replace(/^[✓✗] */, ''))
}

// 内容生成脚本不许再把默认输入指向仓库外（上跳两级 / 提工作区兄弟目录名字）。
// 只看拼路径的那几行，不押全文 —— 脚本的注释里完全可以（也应该）解释“旧版曾读过 workdir”，
// 按全文关键名会把说明当违规、下次改注释又不敢写
{
  const NAMES = ['门户文稿', 'workdir', '汇总站_', '词页重做', 'listen_pages', 'vocab_pages']
  const UP_TWO = /['"]\.\.[/'"]\s*,\s*['"]\.\./        // 同一个 join 里连上跳两级 = 出了仓库
  const esc = []
  for (const f of ['scripts/gen-data.py', 'scripts/refresh-papers.mjs', 'scripts/add-numbers.py']) {
    const lines = read(path.join(PORTAL, f)).split('\n')
    lines.forEach((ln, i) => {
      const pathLine = /(path\.(?:join|resolve)\(|os\.path\.join\()/.test(ln)
      const bad = (pathLine && (UP_TWO.test(ln) || NAMES.some(n => ln.includes(n)))) || ln.includes('/Users/')
      if (bad) esc.push(`${f}:${i + 1} → ${ln.trim().slice(0, 56)}`)
    })
  }
  ok('内容生成脚本的默认输入全在仓内（不依赖工作区兄弟目录）', esc.length === 0,
    esc.join(' | ') || 'gen-data/refresh-papers/add-numbers 拼路径的行全部只读仓内')
}

const failed = results.filter(r => !r.pass)
const passed = results.filter(r => r.pass && !r.skipped)
const skipped = results.filter(r => r.skipped)
console.log(`\n==== verify_content ${passed.length}/${passed.length + failed.length} 通过` +
  (skipped.length ? ` · ${skipped.length} 项跳过` : '') + ` ====`)
process.exit(failed.length ? 1 : 0)
