// 线上核对：顶栏「学习笔记」点一下是否直达「全部笔记」，以及页内三个栏目条是否还在。
// 2026-10-26 起顶栏下拉已去掉（用户定案：默认就该是全部笔记），所以不再 hover 面板。
//
// 跑法：NODE_PATH="$(npm root -g)" node scripts/shot_online_nav.cjs
const { chromium } = require('playwright')
const path = require('path')
const OUT = path.join(__dirname, 'shots')
const BASE = process.env.SHOT_BASE || 'https://luojun0115.github.io/deepseek-words/'

;(async () => {
  const browser = await chromium.launch()
  const errs = []
  // 线上 GitHub Pages 在本机网络下时快时断：启动与导航都重试三次（SIGSEGV / Timeout 都见过）
  let page = null
  for (let i = 0; i < 3 && !page; i++) {
    try {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 2 })
      const p = await ctx.newPage()
      p.on('pageerror', (e) => errs.push('pageerror: ' + e.message))
      p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
      await p.addInitScript(() => { try { localStorage.setItem('portal_theme', 'forest') } catch (e) {} })
      await p.goto(BASE, { waitUntil: 'domcontentloaded', timeout: 30000 })
      page = p
    } catch (e) {
      console.warn(`  导航失败（第 ${i + 1} 次）：${e.name}`)
      await new Promise((r) => setTimeout(r, 2000))
    }
  }
  if (!page) { console.log('✗ 线上页面三次都没打开，放弃截图（DOM 仍可用 curl 核对）'); await browser.close(); process.exit(0) }
  await page.waitForTimeout(2500)
  console.log('  ✓ 首页已开')

  // 顶栏「学习笔记」应该是一个普通链接，不是下拉按钮
  const isLink = await page.locator('.VPNavBarMenu a:has-text("学习笔记")').count()
  const isGroup = await page.locator('.VPNavBarMenuGroup').count()
  console.log(`  顶栏学习笔记：链接 ${isLink} 个 / 下拉组 ${isGroup} 个`)

  // 点一下 → 应该直达「全部笔记」
  await page.click('.VPNavBarMenu a:has-text("学习笔记")')
  await page.waitForTimeout(2500)
  console.log('  ✓ 点击后 URL：', page.url())
  await page.screenshot({ path: path.join(OUT, '80_线上_点一次就进全部笔记.png') })

  // 页内三个栏目条还在，且当前项＝全部笔记
  const tabs = await page.locator('.dr-subtabs .dr-subtab').allTextContents()
  const on = await page.locator('.dr-subtabs .dr-subtab.is-on').allTextContents()
  console.log('  页内栏目条：', tabs.map((s) => s.replace(/\s+/g, ' ').trim()).join(' | '))
  console.log('  当前项：', on.map((s) => s.replace(/\s+/g, ' ').trim()).join(' | '))

  await browser.close()
  if (errs.length) { console.log('\n页面报错：'); errs.forEach((e) => console.log('  ! ' + e)) }
  else console.log('\n无页面报错')
})()