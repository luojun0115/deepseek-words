// 论文列表时间排序验证：默认新→旧、点按钮切旧→新、切「按编号」后按钮消失
// 跑法：先起 preview（npx vitepress preview . --port 4188），再
//   NODE_PATH=$(npm root -g) node scripts/shot_paper_sort.cjs
const { chromium } = require('playwright')
const path = require('path')
const SHOT = path.resolve(__dirname, '../previews')
const URL = 'http://localhost:4188/deepseek-words/papers/index.html'   // preview 坑：目录 URL 回退到 SPA 空壳，必须带 .html

// 卡片顺序 = 各卡封面图编号（aria-label 前两位）
const order = async (pg) => pg.$$eval('.dr-card.is-paper .dr-card-media',
  (els) => els.map((e) => e.getAttribute('aria-label').split(' ')[0]))

;(async () => {
  const b = await chromium.launch()
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
  await pg.goto(URL, { waitUntil: 'networkidle' })

  const def = await order(pg)
  console.log('默认排序(按时间) 前5:', def.slice(0, 5).join(','), '后3:', def.slice(-3).join(','))
  const selVal = await pg.locator('.dr-sort select').inputValue()
  console.log('下拉当前值:', selVal, '| 方向钮文案:', await pg.locator('.dr-dir').innerText())

  await pg.locator('.dr-tools').screenshot({ path: path.join(SHOT, '133_论文排序_默认新到旧.png') })
  await pg.locator('.dr-grid').screenshot({ path: path.join(SHOT, '134_论文排序_首屏卡片.png') })

  await pg.locator('.dr-dir').click()
  await pg.waitForTimeout(300)
  const rev = await order(pg)
  console.log('点「旧→新」后 前5:', rev.slice(0, 5).join(','), '后3:', rev.slice(-3).join(','))
  console.log('方向钮文案:', await pg.locator('.dr-dir').innerText())
  await pg.locator('.dr-tools').screenshot({ path: path.join(SHOT, '135_论文排序_旧到新.png') })

  await pg.locator('.dr-sort select').selectOption('num')
  await pg.waitForTimeout(300)
  const byNum = await order(pg)
  console.log('切「按编号」前5:', byNum.slice(0, 5).join(','), '| 方向钮存在:', await pg.locator('.dr-dir').count())

  // 水合报错检查
  const errs = []
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()) })
  await pg.reload({ waitUntil: 'networkidle' })
  console.log('控制台错误:', errs.length ? errs.join(' | ') : '无')
  await b.close()
  console.log('验证完成')
})()
