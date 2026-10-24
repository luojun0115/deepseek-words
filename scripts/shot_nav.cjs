// 栏目改名后的目检截图：导航栏文案 + 首页两键 + 三个内容页
// 跑法：先起 preview（npx vitepress preview . --port 4188），再
//   NODE_PATH=$(npm root -g) node scripts/shot_nav.cjs
const { chromium } = require('playwright')
const path = require('path'), fs = require('fs')
const SHOT = path.resolve(__dirname, '../previews')
fs.mkdirSync(SHOT, { recursive: true })
// 站点固定在 base 子路径下（与 GitHub Pages 一致）；换 base 用 PORTAL_BASE 覆盖
const BASE = process.env.PORTAL_BASE || 'http://localhost:4188/deepseek-words'

;(async () => {
  const b = await chromium.launch()
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } })
  const targets = [[BASE + '/', '改名后_01_首页导航与两键'],
                   [BASE + '/vocab.html', '改名后_02_词汇学习索引'],
                   [BASE + '/listen.html', '改名后_03_词汇朗读索引'],
                   [BASE + '/papers/', '改名后_04_论文总览']]   // 2026-10-25 搬进 papers/ 文件夹，URL 变 /papers/
  for (const [url, name] of targets) {
    await pg.goto(url, { waitUntil: 'networkidle' })
    const nav = (await pg.locator('.VPNavBarMenuLink').allInnerTexts()).map(s => s.trim()).filter(Boolean)
    console.log(name, '| 导航:', nav.join(' / '))
    await pg.screenshot({ path: path.join(SHOT, name + '.png') })
  }
  // 断言：站里不应再出现「词汇网页」「单词听力」这两个栏目名（文件名里的 单词听力 是路径，不算）
  let bad = 0
  for (const [url] of targets) {
    const t = await pg.goto(url, { waitUntil: 'networkidle' }).then(() => pg.locator('body').innerText())
    const hit = ['词汇网页', '单词听力'].filter(k => t.includes(k))
    if (hit.length) bad++
    console.log('残留检查', url, hit.length ? '✗ ' + hit.join('、') : '✓ 无残留')
  }
  await b.close()
  process.exit(bad ? 1 : 0)
})()
