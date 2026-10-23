// 正式站（VitePress preview）自查：首页两主题 / 弹窗 / 词汇页头部
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
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1 })
    const page = await ctx.newPage()
    page.on('pageerror', (e) => errs.push(name + ': ' + e.message))
    page.on('console', (m) => { if (m.type() === 'error') errs.push(name + ' console: ' + m.text()) })
    await page.addInitScript((t) => { try { localStorage.setItem('portal_theme', t) } catch (e) {} }, theme)
    await page.goto(BASE + (opt.path || ''), { waitUntil: 'networkidle' })
    await page.waitForTimeout(700)

    if (opt.click) {
      await page.click('.dr-find')
      await page.waitForTimeout(400)
      if (opt.type) { await page.fill('.sm-bar input', opt.type); await page.waitForTimeout(300) }
    }
    await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: !!opt.full })
    await ctx.close()
  }

  await shot('50_station_home_forest')
  await shot('51_station_home_midnight', { theme: 'midnight' })
  await shot('52_station_search', { click: true })
  await shot('53_station_search_r1', { click: true, type: 'r1' })
  await shot('54_station_vocab_head', { path: 'vocab.html' })
  await shot('55_station_home_390', { w: 390 })

  await browser.close()
  if (errs.length) { console.log('PAGE ISSUES:'); errs.forEach((e) => console.log('  ', e)) }
  else console.log('OK: 6 shots, no page errors')
})()
