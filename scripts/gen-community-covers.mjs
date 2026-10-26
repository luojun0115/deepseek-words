#!/usr/bin/env node
// 社区大学的视频封面生成器 → public/covers/C<辑>_<集>.png
//
// 数据真源是 data/community.json（页面组件读同一份），本脚本只负责把它画成图：
// 暖纸底 + 8 色盘 + L1/L2/L3 三版式（scripts/covers-style.mjs，全站唯一配色真源）。
//
// 角位（2026-10-26 用户两次定案后统一成这一套，三版式共用）：
//   左上  编号大色块 01        —— 原来只有 L3 有，用户要求三版式统一成这个形式
//   右上  空                   —— 播放标（小电视/圆键）试过三版样品后用户否掉：
//                                 「右下角已经显示时间了，其实这就代表是个视频了」；
//                                 小电视那类图标留着以后确有需要时再加
//   右下  时长胶囊 21:57       —— 从右上/左下统一挪到右下（视频页通行位置）
//   左下  眉标 + 播放数两行    —— 顶部两个角被编号占了，整块搬下来
//   中央  主视觉大字 + 英文小字行
// 论文封面上那套「引号 + 年份」在这里全部换掉；右下角不再放 NO 角标（已升到左上）。
//
// 跑法：npm run community-covers
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { coverLook, PAPER, PAPER2, INK, SERIF, SANS, MONO } from './covers-style.mjs'
import { launchBrowser, shoot } from './covers-render.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.join(DIR, '../public/covers')
const W = 1200, H = 750
const DATA = JSON.parse(fs.readFileSync(path.join(DIR, '../data/community.json'), 'utf8'))

const fmtDur = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
const fmtViews = (n) => (n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : String(n))

/* 一辑内部按顺序排色排版式（拉丁方错位），辑与辑之间接上序号继续排，
   这样二期三期的封面不会跟第壹辑撞成同一种版式。 */
const flat = DATA.issues.flatMap((iss) => iss.episodes.map((ep) => ({ iss, ep })))

function html({ iss, ep }, i) {
  const { color: c, style } = coverLook(i, { staggered: true })
  const left = style === 'L3'                 // L3 亮纸色签：正文左对齐，其余居中
  const pad = left ? '72px' : '52px'
  const line = ep.lines.join('<br>')
  const widthOf = (s) => [...s].reduce((n, ch) => n + (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch) ? 1 : 0.56), 0)
  const em = Math.max(...ep.lines.map(widthOf))
  const fs = left
    ? Math.max(46, Math.min(66, Math.round(760 / em)))
    : Math.max(52, Math.min(78, Math.round(840 / em)))

  const chrome = `*{margin:0;box-sizing:border-box}
    .cover{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:${SANS};
      display:${left ? 'block' : 'flex'};flex-direction:column;align-items:${left ? 'stretch' : 'center'};
      justify-content:${left ? 'flex-start' : 'center'};text-align:${left ? 'left' : 'center'}}
    .no{position:absolute;left:${pad};top:52px;min-width:96px;height:96px;padding:0 20px;border-radius:18px;
      background:${c.deep};color:#fff;display:flex;align-items:center;justify-content:center;
      font:700 40px/1 ${MONO};letter-spacing:.02em}
    .dur{position:absolute;right:${pad};bottom:46px;padding:10px 16px;border-radius:999px;
      background:${c.deep};color:#fff;font:700 19px/1 ${MONO}}
    .meta{position:absolute;left:${pad};bottom:44px;display:flex;flex-direction:column;gap:11px}
    .top{font:400 19px/1 ${MONO};letter-spacing:.1em;color:${c.deep};opacity:.85}
    .bot{font:400 18px/1 ${MONO};letter-spacing:.08em;color:${c.deep};opacity:.6}
    .line{text-wrap:balance;font:600 ${fs}px/1.4 ${SERIF};color:${INK};max-width:1000px;padding:0 40px}
    .sub{margin-top:20px;font:400 21px/1.5 ${MONO};color:${c.deep};opacity:.85;max-width:900px;padding:0 40px}`

  const deco = {
    L1: { bg: PAPER, extra: `.cover::after{content:"";position:absolute;inset:0;opacity:.05;pointer-events:none;
        background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>")}
      .edge{position:absolute;left:0;top:0;bottom:0;width:18px;background:${c.main}}
      .blob{position:absolute;right:-120px;top:-140px;width:460px;height:460px;border-radius:50%;background:${c.main};opacity:.11}
      .frame{position:absolute;inset:26px;border:1px solid rgba(36,30,23,.10);pointer-events:none}`,
      html: `<div class="blob"></div><div class="edge"></div><div class="frame"></div>` },
    L2: { bg: c.soft, extra: `.corner{position:absolute;right:0;top:0;width:236px;height:236px;background:${c.main};
        clip-path:polygon(100% 0, 100% 100%, 0 0)}
      .dots{position:absolute;right:34px;top:34px;width:104px;height:104px;
        background-image:radial-gradient(${PAPER2} 5.5px, transparent 6px);background-size:26px 26px;opacity:.9}
      .frame{position:absolute;inset:26px;border:1.5px solid ${c.main};opacity:.55;pointer-events:none}
      .line{font:800 ${fs}px/1.34 ${SANS}}`,
      html: `<div class="corner"></div><div class="dots"></div><div class="frame"></div>` },
    // L3 顶部那条主色横带跟编号块同高（top:52 起），所以编号往下挪到 96
    L3: { bg: PAPER2, extra: `.topbar{position:absolute;left:0;right:0;top:0;height:12px;background:${c.main}}
      .no{top:96px}
      .codes{position:absolute;left:72px;bottom:150px;display:flex;gap:8px;align-items:flex-end;height:32px}
      .codes i{display:block;width:15px;height:26px;border-radius:2px;background:${c.main};opacity:.85}
      .codes i:nth-child(3n){height:16px;opacity:.55}
      .codes i:nth-child(4n){height:32px;opacity:.7}
      .line{position:absolute;left:72px;right:72px;top:296px;text-align:left;padding:0}
      .sub{position:absolute;left:72px;right:220px;top:252px;margin-top:0;padding:0;text-align:left;font-size:20px}`,
      html: `<div class="topbar"></div><div class="codes">${'<i></i>'.repeat(12)}</div>` },
  }[style]

  const body = `<div class="no">${ep.no}</div>
      <div class="line">${line}</div><div class="sub">${ep.sub}</div>
      <div class="meta"><span class="top">社区大学 · ${iss.title}</span>
        <span class="bot">${fmtViews(ep.views)} 播放 · UP 主 ${ep.up || iss.up}</span></div>
      <div class="dur">${fmtDur(ep.dur)}</div>`

  return `<!doctype html><html><head><meta charset="utf-8"><style>${chrome}
    .cover{background:${deco.bg}}${deco.extra}</style></head><body><div class="cover">${deco.html}${body}
    </div></body></html>`
}

fs.mkdirSync(OUT, { recursive: true })
const browser = await launchBrowser()
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })
for (let i = 0; i < flat.length; i++) {
  const { iss, ep } = flat[i]
  const { style } = coverLook(i, { staggered: true })
  const out = path.join(OUT, ep.cover)
  await shoot(page, html({ iss, ep }, i), out, W, H)
  console.log(`${style}  ${path.basename(out)}   ${ep.lines.join(' / ')}   ${fmtDur(ep.dur)}`)
}
await browser.close()
console.log(`\n${flat.length} 张社区大学封面 → ${OUT}`)
