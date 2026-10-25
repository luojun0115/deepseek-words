// 线上专题案例页截图：先开首页（能连通），再走站内点击进入专题页，
// 避免直接 goto 深路径时 GitHub Pages 的 CDN 长连接把导航卡死。
const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'shots')
const BASE = process.env.SHOT_BASE || 'https://luojun0115.github.io/deepseek-words/'

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
  page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await page.addInitScript(() => { try { localStorage.setItem('portal_theme', 'forest') } catch (e) {} })

  await page.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 60000 })
  await page.waitForTimeout(2500)
  console.log('  ✓ 首页已开')

  // 顶栏「学习笔记」下拉 → 专题案例
  await page.hover('.VPNavBarMenuGroup .button')
  await page.waitForTimeout(600)
  await page.click('.VPNavBarMenuGroup .VPMenuLink .link:has-text("专题案例")')
  await page.waitForTimeout(3000)
  console.log('  ✓ 已进入', page.url())

  await page.screenshot({ path: path.join(OUT, '78_线上_专题案例页.png'), fullPage: true })
  await page.hover('.VPNavBarMenuGroup .button')
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(OUT, '79_线上_顶栏下拉.png') })
  console.log('  ✓ 截图已存')

  await browser.close()
  if (errs.length) { console.log('\n页面报错：'); errs.forEach((e) => console.log('  ! ' + e)) }
  else console.log('\n无页面报错')
})()