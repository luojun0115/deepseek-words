#!/usr/bin/env node
// 由 theme-defs.mjs 生成 theme.generated.css（单一真源 → CSS）。
// 两道关卡：① 14 个变量缺任何一个 → 退出码 1；② 逐套算 WCAG 对比度，不达标的配色 → 退出码 1
//（新加配色时靠它拦住「看着好看但读不清」的套，而不是等到页面上发现）
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { THEMES, THEME_VARS, DEFAULT_THEME } from '../.vitepress/theme/theme-defs.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(__dirname, '../.vitepress/theme/theme.generated.css')

// 对比度门限：正文级 4.5:1（WCAG AA）。白名单：无。
const MIN = 4.5
const PAIRS = [
  ['--dr-ink', '--dr-bg', '正文/背景'],
  ['--dr-ink', '--dr-panel', '正文/卡片'],
  ['--dr-ink2', '--dr-bg', '次要文字/背景'],
  ['--dr-accent', '--dr-bg', '主色/背景'],
  ['--dr-on', '--dr-accent', '按钮文字/主色'],
  ['--dr-hi', '--dr-bg', '标题重音/背景'],
  ['--dr-hi2', '--dr-bg', '标题次重音/背景'],
]
const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (hex) => {
  const n = hex.replace('#', '')
  const s = n.length === 3 ? n.split('').map((x) => x + x).join('') : n
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(s.slice(i, i + 2), 16) / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
  return (x + 0.05) / (y + 0.05)
}

const errs = []
const rows = []
if (THEMES.length > 10) errs.push(`主题共 ${THEMES.length} 套，数字键 1–0 只能直达 10 套（要么删几套，要么改 ThemeSwitcher 的键位方案）`)
for (const [i, t] of THEMES.entries()) {
  for (const v of THEME_VARS) {
    if (!(v in t.v)) { console.error(`主题 ${t.id} 缺变量 ${v}`); process.exit(1) }
  }
  const got = PAIRS.map(([a, b, label]) => {
    const r = ratio(t.v[a], t.v[b])
    if (r < MIN) errs.push(`${t.name}(${t.id}) ${label}：${t.v[a]} vs ${t.v[b]} = ${r.toFixed(2)}:1 < ${MIN}:1`)
    return r.toFixed(1)
  })
  rows.push(`  键 ${'1234567890'[i]}  ${t.name.padEnd(4, '　')} ${t.dark ? '暗' : '明'}  ${got.join(' / ')}   ← 正文bg · 正文panel · 次要bg · 主色bg · 按钮字 · 标题重音 · 标题次重音`)
}

let css = `/* 自动生成，勿手改；改主题请编辑 theme-defs.mjs 后重跑本脚本 */\n`

for (const t of THEMES) {
  const sel = t.id === DEFAULT_THEME ? `:root, html[data-theme='${t.id}']` : `html[data-theme='${t.id}']`
  const vars = THEME_VARS.map(v => `  ${v}: ${t.v[v]};`).join('\n')
  const dark = !!t.dark                                // 明暗由 theme-defs 里的 dark 字段定，不另列名单
  const vp = [
    `  color-scheme: ${dark ? 'dark' : 'light'};`,
    `  --vp-c-bg: var(--dr-bg);`,
    `  --vp-c-bg-alt: var(--dr-bg2);`,
    `  --vp-c-bg-elv: var(--dr-panel);`,
    `  --vp-c-bg-soft: var(--dr-soft);`,
    `  --vp-c-text-1: var(--dr-ink);`,
    `  --vp-c-text-2: var(--dr-ink2);`,
    `  --vp-c-text-3: var(--dr-ink2);`,
    `  --vp-c-divider: var(--dr-line);`,
    `  --vp-c-brand-1: var(--dr-accent);`,
    `  --vp-c-brand-2: var(--dr-accent);`,
    `  --vp-c-brand-3: var(--dr-accent);`,
    `  --vp-c-default-soft: var(--dr-soft);`,
    `  --vp-button-brand-bg: var(--dr-accent);`,
    `  --vp-button-brand-hover-bg: var(--dr-accent);`,
    `  --vp-button-brand-text: var(--dr-on);`,
    `  --vp-button-brand-hover-text: var(--dr-on);`,
    `  --vp-home-hero-name-color: var(--dr-accent);`,
    `  --vp-nav-bg-color: var(--dr-bg);`,
    `  --vp-sidebar-bg-color: var(--dr-bg2);`,
    `  --vp-c-gutter: var(--dr-bg);`,
  ].join('\n')
  css += `${sel} {\n${vars}\n${vp}\n}\n\n`
}

// 先报全部对比度问题，不达标就不写盘（跟 gen-data.py 同一个口径：不留半成品）
if (errs.length) {
  console.error(`✗ 配色不达标的 ${errs.length} 处（门限 ${MIN}:1）：`)
  for (const e of errs) console.error('   - ' + e)
  process.exit(1)
}

fs.writeFileSync(OUT, css)
console.log(rows.join('\n'))
console.log(`生成 ${THEMES.length} 套主题（默认：${DEFAULT_THEME}）· 对比度全部 ≥ ${MIN}:1 → ${path.relative(process.cwd(), OUT)}`)
