#!/usr/bin/env node
// 专题笔记封面生成器：notes/ 下不带 NN_ 编号前缀的 md（如 位置编码.md）→ public/covers/T_<名>.png
//
// 为什么单独一个脚本：32 篇论文的封面在 design/20261020_MotionFace风格/covers3 里一次出齐，
// 专题笔记是随时会新增的（用户 2026-10-24 要求「以后额外的文章都要生成一个封面」），
// 所以做成「读 frontmatter → 出图」的增量脚本，加文章不用再碰任何代码。
//
// 用法：
//   node scripts/gen-topic-covers.mjs          # 全量渲染；内容没变的文件不覆盖（git 保持干净）
//   node scripts/gen-topic-covers.mjs --force  # 强制重写所有文件
//
// 为什么全量渲染而不做「md 比 png 新才重出」的增量：配色按显示顺序 A/B/C 轮换，
// 列表一变（新增/改名）顺序就变，增量会出现「老图还是旧配色、新图是新配色」的错位。
// 每次全出多花两三秒，换来配色永远和列表对齐；内容相同的图再比字节就不会写盘。
//
// 单篇要写的东西（都在 md 的 frontmatter 里，三个可选字段）：
//   cover:       "金句第一行， / 金句第二行。"   ← 用 " / " 断行；不写就退回用 title
//   coverKicker: "Topic · 位置编码"              ← 封面顶部小字；不写就是 "Topic · <文件名>"
//   coverYear:   "2017 — 2025"                   ← 封面底部；不写就只显示「鲸读」
//
// 视觉沿用 covers3 的 A/B/C 三风格轮换，尺寸 1200×750，与 32 篇论文封面同规格。
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// playwright 是全局装的（仓里没进 devDependencies），而 ESM 的 import 不认 NODE_PATH
// ——那是 CJS 的机制。用 createRequire 走回 require；仓内找不到就自己查全局根目录，
// 这样 `npm run covers` 直接跑得动，不用记着加 NODE_PATH=$(npm root -g)。
const require = createRequire(import.meta.url)
function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    const { execSync } = require('node:child_process')
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    return require(path.join(globalRoot, 'playwright'))
  }
}
const { chromium } = loadPlaywright()

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NOTES = path.join(ROOT, 'notes')
const OUT = path.join(ROOT, 'public/covers')
const W = 1200, H = 750
const FORCE = process.argv.includes('--force')

const SERIF = 'Georgia, "Songti SC", "Noto Serif SC", "Times New Roman", serif'
const SANS = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif'
const MONO = 'ui-monospace, Menlo, Consolas, monospace'

const POSTER = [
  { bg: '#c72a2a', fg: '#ffffff', ac: '#f5d90a' },
  { bg: '#14261c', fg: '#eafbe7', ac: '#d9f45f' },
  { bg: '#f2c200', fg: '#1d1d1b', ac: '#c72a2a' },
  { bg: '#1b2a4a', fg: '#ffffff', ac: '#f2c14e' },
  { bg: '#2b2b2b', fg: '#ffffff', ac: '#d9f45f' },
  { bg: '#e8e2d4', fg: '#1d1d1b', ac: '#c72a2a' },
]

/* frontmatter 只取要的两三行，不引 js-yaml：这几个字段都是单行字符串，正则足够 */
function readFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const body = m ? m[1] : ''
  const get = (key) => {
    const v = body.match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
    if (!v) return ''
    // 去掉包住整行的引号（YAML 里写了引号才不会被 # 或 : 打断）
    return v[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim()
  }
  return { title: get('title'), cover: get('cover'), kicker: get('coverKicker'), year: get('coverYear'), order: get('order') }
}

/* 按最长一行的视觉宽度定字号（与 covers3 同一套算法，保证同批封面字号手感一致） */
function fitSize(lines) {
  const widthOf = (s) => [...s].reduce((n, ch) => n + (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch) ? 1 : 0.56), 0)
  const em = Math.max(...lines.map(widthOf))
  return Math.max(52, Math.min(78, Math.round(880 / em)))
}

function html(style, lines, top, bot, i, num) {
  const fs = fitSize(lines)
  const line = lines.join('<br>')
  const base = `*{margin:0;box-sizing:border-box}
    .cover{width:${W}px;height:${H}px;position:relative;overflow:hidden;
      display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    .top{position:absolute;left:0;right:0;top:52px;text-align:center;font:400 22px/1 ${MONO};letter-spacing:.12em}
    .bot{position:absolute;left:0;right:0;bottom:50px;text-align:center;font:400 21px/1 ${MONO};letter-spacing:.12em}
    .frame{position:absolute;inset:26px;pointer-events:none}
    .line{text-wrap:balance}`

  if (style === 'A') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
      .cover{background:#0e0e0d;font-family:${SANS}}
      .glow{position:absolute;inset:0;background:radial-gradient(760px 520px at 50% -18%, rgba(217,244,95,.15), transparent 70%)}
      .frame{border:1px solid rgba(255,255,255,.10)}
      .mk{font:800 96px/0.8 ${SERIF};color:#d9f45f;margin-bottom:8px}
      .line{font:600 ${fs}px/1.36 ${SERIF};color:#f4f2ec;letter-spacing:.005em;max-width:1000px;padding:0 40px}
      .rule{width:56px;height:3px;background:#d9f45f;border-radius:2px;margin-top:30px}
      .top{color:rgba(255,255,255,.46)}
      .bot{color:rgba(255,255,255,.34)}
    </style></head><body><div class="cover"><div class="glow"></div><div class="frame"></div>
      <div class="mk">\u201C</div>
      <div class="line">${line}</div>
      <div class="rule"></div>
      <div class="top">${top}</div><div class="bot">${bot}</div>
    </div></body></html>`
  }

  if (style === 'B') {
    const c = POSTER[i % POSTER.length]
    return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
      .cover{background:${c.bg};color:${c.fg};font-family:${SANS}}
      .wm{position:absolute;right:-34px;bottom:-58px;font:800 340px/1 ${SANS};letter-spacing:-.06em;color:${c.fg};opacity:.10}
      .frame{border:1px solid ${c.fg};opacity:.16}
      .line{position:relative;font:800 ${fs}px/1.34 ${SANS};letter-spacing:-.01em;max-width:1000px;padding:0 40px}
      .rule{position:relative;width:64px;height:5px;background:${c.ac};border-radius:3px;margin-top:32px}
      .top{color:${c.fg};opacity:.8}
      .bot{color:${c.fg};opacity:.7}
    </style></head><body><div class="cover">
      <div class="wm">${num}</div><div class="frame"></div>
      <div class="line">${line}</div>
      <div class="rule"></div>
      <div class="top">${top}</div><div class="bot">${bot}</div>
    </div></body></html>`
  }

  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
    .cover{background:#f5f3ee;font-family:${SANS}}
    .cover::after{content:"";position:absolute;inset:0;opacity:.05;pointer-events:none;
      background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>")}
    .mk{font:800 100px/0.8 ${SERIF};color:#ded9cb;margin-bottom:6px}
    .frame{border:1px solid rgba(29,29,27,.12)}
    .line{position:relative;font:600 ${fs}px/1.4 ${SERIF};color:#1d1d1b;max-width:980px;padding:0 40px}
    .rule{position:relative;width:56px;height:3px;background:#c72a2a;margin-top:32px}
    .top{color:rgba(29,29,27,.42)}
    .bot{color:rgba(29,29,27,.38)}
  </style></head><body><div class="cover"><div class="frame"></div>
    <div class="mk">\u201C</div>
    <div class="line">${line}</div>
    <div class="rule"></div>
    <div class="top">${top}</div><div class="bot">${bot}</div>
  </div></body></html>`
}

/* 专题 = 文件名不带 NN_ 前缀的 md（与 gen-notes.mjs 的认法一致：只有编号前 缀才算论文笔记）；
   index.md 是学习笔记 tab 页本身（2026-10-25 搬进 notes/），
   papers.md 是 /notes/papers.html 的兼容跳转粧——两者都不出封面 */
const topics = fs.readdirSync(NOTES)
  .filter((f) => f.endsWith('.md') && !/^\d\d_/.test(f) && !['index.md', 'papers.md'].includes(f))
  .sort()

if (!topics.length) {
  console.log('notes/ 下没有专题笔记（不带 NN_ 编号前缀的 md），跳过')
  process.exit(0)
}

/* 先读全部 frontmatter 再统一排序：顺序要与 PaperIndex.vue 的 TOPICS 完全一致
   （order 小在前，同 order 按文件名），这样「第几张卡配哪套配色」是对得上的 */
const items = topics.map((f) => {
  const dir = f.replace(/\.md$/, '')
  const fm = readFrontmatter(fs.readFileSync(path.join(NOTES, f), 'utf8'))
  // 金句：frontmatter 的 cover 优先；没写就把 title 去掉「· 专题笔记」这类尾巴当金句
  const raw = fm.cover || (fm.title || dir).replace(/\s*·\s*专题笔记\s*$/, '')
  return {
    dir,
    png: path.join(OUT, `T_${dir}.png`),
    lines: raw.split('/').map((s) => s.trim()).filter(Boolean),
    top: fm.kicker || `Topic · ${dir}`,
    bot: fm.year ? `${fm.year} · 鲸读` : '鲸读 · 专题',
    order: Number(fm.order) || 500,
  }
})
items.sort((a, b) => a.order - b.order || a.dir.localeCompare(b.dir))
const jobs = items.map((it, i) => ({ ...it, hue: i % 3 }))

fs.mkdirSync(OUT, { recursive: true })
// 无头 chromium 在本机会偶发 SIGSEGV（启动阶段就崩，与页面内容无关），
// 重试两三次基本都能起来。别让它把「加一篇文章」这件事变成运气问题。
async function launchBrowser() {
  for (let i = 0; i < 3; i++) {
    try {
      return await chromium.launch()
    } catch (e) {
      if (i === 2) throw e
      console.warn(`  chromium 启动失败（第 ${i + 1} 次），重试…`)
      await new Promise((r) => setTimeout(r, 500))
    }
  }
}
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })

let written = 0
for (const j of jobs) {
  // A/B/C 按显示顺序轮换（hue 见上面排序那段）；最后两个参数：给 B 风格的配色下标，
  // 以及 B 风格右下角的大水印号 —— 后者传空，因为专题文章没有论文编号，印个「02」会跟 32 篇那边撞语义
  const style = ['A', 'B', 'C'][j.hue]
  await page.setContent(html(style, j.lines, j.top, j.bot, j.hue, ''), { waitUntil: 'load' })
  // 先截到临时文件再比字节：内容没变就丢掉，避免每次全量都改一遍 png 的 mtime/字节把 git 弄脏。
  // 临时名必须以 .png 结尾——playwright 按扩展名推断图片格式，`.png.tmp` 会报 unsupported mime type
  const tmp = j.png.replace(/\.png$/, '.tmp.png')
  await page.screenshot({ path: tmp, clip: { x: 0, y: 0, width: W, height: H } })
  const same = !FORCE && fs.existsSync(j.png) && fs.readFileSync(j.png).equals(fs.readFileSync(tmp))
  if (same) {
    fs.unlinkSync(tmp)
    console.log(`${style}  ${path.relative(ROOT, j.png)}   未变`)
  } else {
    fs.renameSync(tmp, j.png)
    written++
    console.log(`${style}  ${path.relative(ROOT, j.png)}   ${j.lines.join(' / ')}`)
  }
}

await browser.close()
console.log(`完成：${jobs.length} 篇专题笔记，写入 ${written} 张（其余未变）`)
