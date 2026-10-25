// 暖调多彩封面 + 专题案例页新版式 的自查截图
// 跑法：NODE_PATH="$(npm root -g)" node scripts/shot_color_covers.cjs
const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'shots')
const BASE = 'http://localhost:4173/deepseek-words/'

;(async () => {
  const browser = await chromium.launch()
  const errs = []

  async function shot(name, opt) {
    opt = opt || {}
    const theme = opt.theme || 'forest'
    const w = opt.w || 1440
    const ctx = await browser.newContext({ viewport: { width: w, height: opt.h || 1000 }, deviceScaleFactor: 2 })
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
  await shot('70_首页_卡墙', { path: '' })
  await shot('71_专题案例页', { path: 'notes/cases/index.html', full: true })
  await shot('72_每日一文页', { path: 'notes/daily/index.html' })
  await shot('73_论文总览页', { path: 'papers/index.html' })
  await shot('74_学习笔记页', { path: 'notes/index.html' })
  await shot('75_专题案例页_深夜', { path: 'notes/cases/index.html', theme: 'midnight' })
  await shot('76_首页_深夜', { path: '', theme: 'midnight' })

  await browser.close()
  if (errs.length) { console.log('\n页面报错：'); errs.forEach((e) => console.log('  ! ' + e)) }
  else console.log('\n无页面报错')
})()