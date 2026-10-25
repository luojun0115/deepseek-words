// 32 篇「摘要导读」封面生成器 → public/covers/NN_short.png
//
// 2026-10-25 起取代 design/20261020_MotionFace风格/covers3/gen.cjs（旧版输出到设计稿目录，
// 再手工拷进 public/covers，两份容易走样）。现在封面图直接落到 public/covers/，是唯一真源。
//
// 视觉规格（scripts/covers-style.mjs）：Claude Code 式暖纸底 + 8 色多彩盘，
// 三套版式 L1/L2/L3 拉丁方错位轮换，同排相邻不同色。
//
// 用法：node scripts/gen-paper-covers.mjs [--force]
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverHTML, coverLook } from './covers-style.mjs'
import { PAPER_LINES } from './covers-lines.mjs'
import { launchBrowser, shoot } from './covers-render.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PAPERS = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/papers.json'), 'utf8'))
const OUT = path.join(ROOT, 'public/covers')
const W = 1200, H = 750
const FORCE = process.argv.includes('--force')

fs.mkdirSync(OUT, { recursive: true })
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })

let written = 0
for (let i = 0; i < PAPERS.length; i++) {
  const p = PAPERS[i]
  const { color, style } = coverLook(i, { staggered: true })
  const lines = (PAPER_LINES[p.num] || '').split('/').map((t) => t.trim()).filter(Boolean)
  const top = `${p.num} · ${p.short}`
  // 底部元信息：年份升级成「年月」——arXiv 号前 4 位就是 YYMM（如 2609.19969 → 2026.09）。
  // 索引页有「按时间（新→旧）」排序，只写年份的话同年几篇排出来分不清先后。
  const ym = `${p.year}.${String(p.arxiv || '').slice(2, 4)}`
  const bot = `${ym} · 鲸读`
  const html = coverHTML({ style, lines, top, bot, color, num: p.num, W, H })
  const out = path.join(OUT, `${p.num}_${p.short}.png`)
  const changed = await shoot(page, html, out, W, H, FORCE)
  if (changed) written++
  console.log(`${style} ${color.key.padEnd(10)} ${path.relative(ROOT, out)}   ${changed ? '已更新' : '未变'}`)
}

await browser.close()
console.log(`完成：${PAPERS.length} 篇论文封面，写入 ${written} 张（其余未变）`)
