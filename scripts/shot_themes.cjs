// 逐套主题截图：把首页在每一套配色下各出一张 PNG，用于人工核对配色（不是断言脚本）。
// 跑法：先 npm run build && 起 preview（默认 4188），再 node scripts/shot_themes.cjs
// 需要全局 playwright：NODE_PATH=$(npm root -g) node scripts/shot_themes.cjs
// 产出：previews/themes/<序号>_<id>_<name>.png（顺序与 theme-defs 的数组/数字键一致）
const { chromium } = require('playwright')
const path = require('path')
const fs = require('fs')

const BASE = process.env.PORTAL_BASE || 'http://localhost:4188/deepseek-words'
const OUT = path.resolve(__dirname, '../previews/themes')
const KEYOF = (i) => '1234567890'[i]

;(async () => {
  const { THEMES, DEFAULT_THEME } = await import(
    require('url').pathToFileURL(path.resolve(__dirname, '../.vitepress/theme/theme-defs.mjs')).href)
  fs.mkdirSync(OUT, { recursive: true })
  const b = await chromium.launch({ headless: true })
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  for (const [i, t] of THEMES.entries()) {
    // 默认那套首屏就在，其余走数字键（走的是真实用户路径，不是直接塞 localStorage）
    if (t.id !== DEFAULT_THEME) await page.keyboard.press(KEYOF(i))
    await page.waitForTimeout(250)
    const now = await page.evaluate(() => document.documentElement.getAttribute('data-theme'))
    if (now !== t.id) { console.error(`✗ 按下 ${KEYOF(i)} 后 data-theme=${now}，期望 ${t.id}`); process.exitCode = 1 }
    const f = `${OUT}/${String(i + 1).padStart(2, '0')}_${t.id}_${t.name}.png`
    await page.screenshot({ path: f })
    console.log(`✓ ${t.name}（${t.id}·键 ${KEYOF(i)}${t.dark ? '·暗' : ''}）→ ${path.relative(process.cwd(), f)}`)
  }
  await b.close()
})()
