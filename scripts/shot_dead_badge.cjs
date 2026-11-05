// 死链角标 demo 截图：/sites/ 页抬头 + 带 404 标的砖
// 跑法：先起 preview（npx vitepress preview . --port 4188），再
//   NODE_PATH=$(npm root -g) node scripts/shot_dead_badge.cjs
const { chromium } = require('playwright')
const path = require('path')
const SHOT = path.resolve(__dirname, '../previews')
const URL = 'http://localhost:4188/deepseek-words/sites/'

;(async () => {
  const b = await chromium.launch()
  const pg = await b.newPage({ viewport: { width: 1600, height: 1000 } })
  await pg.goto(URL, { waitUntil: 'networkidle' })
  const n = await pg.locator('.nav-blk.is-dead').count()
  console.log('is-dead 砖数量:', n)
  const names = await pg.locator('.nav-blk.is-dead .txt .nm').allInnerTexts()
  console.log('标了 404 的站:', names.join('、'))
  await pg.locator('.nav-mast').screenshot({ path: path.join(SHOT, '130_死链角标_抬头计数.png') })
  // 论文源一行（宽砖 Scholar/HF）+ 社区行（V2EX/Reddit 窄砖）各截一张
  const rows = pg.locator('.nav-row')
  const cnt = await rows.count()
  for (let i = 0; i < cnt; i++) {
    const row = rows.nth(i)
    if (await row.locator('.nav-blk.is-dead').count()) {
      await row.screenshot({ path: path.join(SHOT, `131_死链角标_第${i + 1}行.png`) })
    }
  }
  await pg.screenshot({ path: path.join(SHOT, '132_死链角标_整页.png'), fullPage: true })
  await b.close()
  console.log('截图完成')
})()
