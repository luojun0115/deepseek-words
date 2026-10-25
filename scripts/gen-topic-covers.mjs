#!/usr/bin/env node
// 专题笔记封面生成器：notes/ 下不带 NN_ 编号前缀的 md（如 notes/zhuanti-search/index.md 这类专题页）→ public/covers/T_<名>.png
//
// 为什么单独一个脚本：32 篇论文的封面由 scripts/gen-paper-covers.mjs 出齐，
// 专题笔记是随时会新增的（用户 2026-10-24 要求「以后额外的文章都要生成一个封面」），
// 所以做成「读 frontmatter → 出图」的增量脚本，加文章不用再碰任何代码。
//
// 用法：
//   node scripts/gen-topic-covers.mjs          # 全量渲染；内容没变的文件不覆盖（git 保持干净）
//   node scripts/gen-topic-covers.mjs --force  # 强制重写所有文件
//
// 为什么全量渲染而不做「md 比 png 新才重出」的增量：配色按显示顺序轮换，
// 列表一变（新增/改名）顺序就变，增量会出现「老图还是旧配色、新图是新配色」的错位。
// 每次全出多花两三秒，换来配色永远和列表对齐；内容相同的图再比字节就不会写盘。
//
// 单篇要写的东西（都在 md 的 frontmatter 里，三个可选字段）：
//   cover:       "金句第一行， / 金句第二行。"   ← 用 " / " 断行；没写就退回用 title
//   coverKicker: "Topic · 位置编码"              ← 封面顶部小字；没写就是 "Topic · <文件名>"
//   coverYear:   "2017 — 2025"                   ← 封面底部；没写就只显示「鲸读」
//
// 视觉规格与 32 篇论文封面同源（scripts/covers-style.mjs）：Claude Code 式暖纸底 + 8 色多彩盘。
// 2026-10-25 起老的三风格（A 纯黑 / B 深色海报 / C 米纸）作废——用户说「卡片都是黑的，阴暗了」。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverHTML, coverLook } from './covers-style.mjs'
import { launchBrowser, shoot } from './covers-render.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NOTES = path.join(ROOT, 'notes')
const OUT = path.join(ROOT, 'public/covers')
const W = 1200, H = 750
const FORCE = process.argv.includes('--force')

/* frontmatter 只取要的两三行，不引 js-yaml：这几个字段都是单行字符串，正则足够 */
function readFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const body = m ? m[1] : ''
  const get = (key) => {
    const v = body.match(new RegExp('^' + key + ':[ \\t]*(.+)$', 'm'))
    if (!v) return ''
    // 去掉包住整行的引号（YAML 里写了引号才不会被 # 或 : 打断）
    return v[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim()
  }
  return { title: get('title'), cover: get('cover'), kicker: get('coverKicker'), year: get('coverYear'),
           order: get('order'), coverFile: get('coverFile') }
}

/* 专题卡片的源（2026-10-25 用户要求专题统一目录管理：不再有顶层壳页）：
   ① notes/ 顶层不带 NN_ 前缀的 md（排除 tab 页 index.md 与兼容粧 papers.md）
   ② notes/zhuanti-search/index.md（专题总览）
   ③ notes/zhuanti-search/<子目录>/index.md（每篇精读，卡面元数据写在自己 frontmatter）
   封面图名 = frontmatter 的 coverFile，没写就用最后一段路径名（与 PaperIndex.vue 同一套口径） */
const SOURCES = [
  ...fs.readdirSync(NOTES)
    .filter((f) => f.endsWith('.md') && !/^\d\d_/.test(f) && !['index.md', 'papers.md'].includes(f))
    .sort()
    .map((f) => ({ rel: f, key: f.replace(/\.md$/, '') })),
  ...['zhuanti-search/index.md'].filter((rel) => fs.existsSync(path.join(NOTES, rel)))
    .map((rel) => ({ rel, key: 'zhuanti-search' })),
  ...fs.readdirSync(path.join(NOTES, 'zhuanti-search'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(NOTES, 'zhuanti-search', d.name, 'index.md')))
    .map((d) => d.name).sort()
    .map((name) => ({ rel: `zhuanti-search/${name}/index.md`, key: `zhuanti-search/${name}` })),
]

if (!SOURCES.length) {
  console.log('notes/ 下没有专题笔记，跳过')
  process.exit(0)
}

/* 先读全部 frontmatter 再统一排序：顺序要与 PaperIndex.vue 的 TOPICS 完全一致
   （order 小在前，同 order 按 key），这样「第几张卡配哪套配色」是对得上的 */
const items = SOURCES.map(({ rel, key }) => {
  const fm = readFrontmatter(fs.readFileSync(path.join(NOTES, rel), 'utf8'))
  const slug = fm.coverFile || key.split('/').pop()
  // 金句：frontmatter 的 cover 优先；没写就把 title 去掉「· 专题笔记」这类尾巴当金句
  const raw = fm.cover || (fm.title || slug).replace(/\s*·\s*专题笔记\s*$/, '')
  return {
    dir: key,
    png: path.join(OUT, `T_${slug}.png`),
    lines: raw.split('/').map((s) => s.trim()).filter(Boolean),
    top: fm.kicker || `Topic · ${slug}`,
    bot: fm.year ? `${fm.year} · 鲸读` : '鲸读 · 专题',
    order: Number(fm.order) || 500,
  }
})

if (!items.length) {
  console.log('notes/ 下没有专题笔记，跳过')
  process.exit(0)
}

items.sort((a, b) => a.order - b.order || a.dir.localeCompare(b.dir))
// 编号块用专题内序号：第一张是总览（00），其后是篇目 01、02…
const jobs = items.map((it, i) => {
  const { color, style } = coverLook(i, { staggered: true })
  return { ...it, color, style, num: i === 0 ? '00' : String(i).padStart(2, '0') }
})

fs.mkdirSync(OUT, { recursive: true })
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })

let written = 0
for (const j of jobs) {
  const html = coverHTML({ style: j.style, lines: j.lines, top: j.top, bot: j.bot, color: j.color, num: j.num, W, H })
  const changed = await shoot(page, html, j.png, W, H, FORCE)
  if (changed) written++
  console.log(`${j.style} ${j.color.key.padEnd(10)} ${path.relative(ROOT, j.png)}   ${changed ? '已更新' : '未变'}`)
}

await browser.close()
console.log(`完成：${jobs.length} 篇专题笔记，写入 ${written} 张（其余未变）`)
