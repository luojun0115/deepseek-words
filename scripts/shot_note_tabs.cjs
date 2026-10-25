// 学习笔记子栏（专题案例 / 每日一文）自查截图：三个页面 + 顶栏下拉展开 + 深夜主题
const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'shots')
const BASE = 'http://localhost:4210/deepseek-words/'

;(async () => {
  const browser = await chromium.launch()
  const errs = []

  async function shot(name, opt) {
    opt = opt || {}
    const theme = opt.theme || 'forest'
    const w = opt.w || 1440
    const ctx = await browser.newContext({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 2 })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errs.push(name + ': ' + e.message))
    page.on('console', (m) => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()) })
    await page.addInitScript((t) => { try { localStorage.setItem('portal_theme', t) } catch (e) {} }, theme)
    await page.goto(BASE + (opt.path || ''), { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)

    if (opt.hover) {
      await page.hover(opt.hover)
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: !!opt.full })
    await ctx.close()
    console.log('  ✓', name)
  }

  // ⚠ 本地 preview 伺服器会把 /notes/ 优先命中仓根的旧跳转桩 notes.md（notes.html），
  //   线上 GitHub Pages 是命中 notes/index.html（已核对线上）。所以截图一律用显式 .html 路径。
  await shot('60_notes_all', { path: 'notes/index.html' })
  await shot('61_notes_cases', { path: 'notes/cases/index.html' })
  await shot('62_notes_daily', { path: 'notes/daily/index.html' })
  await shot('63_nav_dropdown', { path: 'notes/index.html', hover: '.VPNavBarMenuGroup .button' })
  await shot('64_nav_dropdown_dark', { path: 'notes/daily/index.html', theme: 'midnight', hover: '.VPNavBarMenuGroup .button' })
  await shot('65_daily_article', { path: 'notes/daily/2026-10-25-mla-kv-cache.html' })
  await shot('66_cases_dark', { path: 'notes/cases/index.html', theme: 'midnight' })

  await browser.close()
  if (errs.length) { console.log('\n页面报错：'); errs.forEach((e) => console.log('  ! ' + e)) }
  else console.log('\n无页面报错')
})()
