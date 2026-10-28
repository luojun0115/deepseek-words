// 门户站自检：走完整用户路径 + 关键断言（含 DECISIONS §C1 的静态页跳转专用断言）
const { chromium } = require('playwright')
// 站点现在固定在 GitHub Pages 的子路径 base 下，本地预览也是这个路径；
// 用 PORTAL_BASE 覆盖（如 DOCS_BASE='/' 构建时跑的旧版）
const BASE = process.env.PORTAL_BASE || 'http://localhost:4188/deepseek-words'
const BPATH = new URL(BASE + '/').pathname      // '/deepseek-words/'
const SHOT = require('path').resolve(__dirname, '../previews')
require('fs').mkdirSync(SHOT, { recursive: true })

// 期望数字全部从总集数据取，不写死（补篇/重排编号后自检无需改代码）
const ST = require('../data/master.json')
const NP = ST.papers            // 篇数
const N_ALL = ST.totalWords     // 全量词次
const N_DEDUP = ST.dedupWords   // 去重词数

// 笔记“已写”数：与 components/PaperIndex.vue / gen-notes.mjs 同一个判空口径
// （去掉 frontmatter 后正文非空）。改任何一处都要三处一起改。
const writtenNotes = (PP) => PP.filter((p) => {
  const f = require('path').resolve(__dirname, '../notes/' + p.dir + '.md')
  if (!require('fs').existsSync(f)) return false
  return !!require('fs').readFileSync(f, 'utf8').replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim()
}).length

const results = []
const ok = (name, cond, extra = '') => {
  results.push({ name, pass: !!cond, extra })
  console.log(`${cond ? '✓' : '✗'} ${name}${extra ? '  — ' + extra : ''}`)
}

;(async () => {
  const b = await chromium.launch({ headless: true })
  const page = await b.newPage({ viewport: { width: 1440, height: 900 } })
  const errors = []
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  page.on('pageerror', e => errors.push(String(e)))

  // 1) 首页 + 卡片数
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const cards = await page.locator('.dr-lib .dr-card').count()
  ok(`首页卡片=${NP} 篇`, cards === NP, '实得 ' + cards)
  ok('首页标题正确', (await page.title()).includes('鲸读 · DeepSeek 论文精读'))
  await page.screenshot({ path: SHOT + '/01_首页_default.png', fullPage: false })

  // 1b) 宽版 + 栅格：1440 视口下一排 4 卡
  const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.dr-lib .dr-grid')).gridTemplateColumns.split(' ').length)
  ok('1440 视口下一排 4 卡', cols === 4, '实得 ' + cols + ' 列')

  // 1b-2) 论文卡金句封面（2026-10-23 同步 MotionFace 原型：covers3 海报随 public/covers 进仓）
  //       笔记索引页还有两类非论文卡：最前面的「论文总览」导览卡（.is-index）
  //       与末尾的专题笔记卡（.is-topic）。论 文卡统一带 .is-paper，数封面只认它
  const covs = await page.$$eval('.dr-lib .dr-card.is-paper .dr-card-media', els => els.map(e => e.style.backgroundImage || ''))
  ok('论文卡 32 张全带金句封面', covs.length === NP && covs.every(s => s.includes('/covers/')), '实得 ' + covs.length + ' 张')
  const covURL = ((covs[0] || '').match(/url\("?([^")]+)"?\)/) || [])[1]
    const covCode = covURL ? await page.evaluate(u => fetch(u).then(r => r.status).catch(() => 0), covURL) : 0
  ok('封面图可加载（首张 HTTP 200）', covCode === 200, (covURL || '?') + ' → ' + covCode)
  // 1b-3) 封面配色门禁（2026-10-25 用户要求：卡片不要纯黑，要 Claude Code 式暖调多彩）
  //   两道关：① 色盘真源里没有黑色系、底色是暖纸白；② 实际渲染出来的封面左上角不是黑色
  const CS = require('../scripts/covers-style.mjs')
  ok('封面底色是暖纸白（不是纯黑）', /^#f/i.test(CS.PAPER) && CS.PAPER !== '#000000', CS.PAPER)
  ok('封面色盘 8 色，每色有 main/deep/soft 三档',
    CS.PALETTE.length === 8 && CS.PALETTE.every((c) => c.main && c.deep && c.soft))
  ok('封面色盘里没有黑色系', !CS.PALETTE.some((c) => /^#0{3,6}$/i.test(c.main)))
  const covURLs = covs.map((s) => (s.match(/url\("?([^")]+)"?\)/) || [])[1]).filter(Boolean)
  const topPixels = await page.evaluate(async (urls) => {
    const out = []
    for (const u of urls.slice(0, 8)) {
      const img = new Image(); img.src = u
      await img.decode()
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(2, 2, 1, 1).data
      out.push([d[0], d[1], d[2]])
    }
    return out
  }, covURLs)
  //   阈值 180：色盘里最暗的 main 色是靛蓝 #3A6BB0（三通道和 201），soft / 纸底都在 600 以上，
  //   而纯黑是 0 —— 180 能把「暗色」和「黑」分开，不会误伤深色主色
  ok('论文卡封面左上角不是黑色（实渲染取样）',
    topPixels.length > 0 && topPixels.every((p) => p[0] + p[1] + p[2] > 180),
    JSON.stringify(topPixels.slice(0, 3)))

  // 1c) 首页报头（components/HomeIntro.vue，2026-10-23 改版：原 .dr-intro 学法卡换成报纸头版）
  //     两枚入口分指「背词」与「学习笔记」（2026-10-24 用户取消「论文总览」栏后，
  //     第二枚从 papers.html 改指 notes.html，论文总览降级为笔记索引最前面的封面卡）
  const ways = await page.$$eval('.dr-hero .dp-links a', els => els.map(e => e.getAttribute('href')))
  // cleanUrls 已关（Pages 不做重写），入口必须是带 base 的 .html；根绝对路径在子路径下会跑到用户站
  //     2026-10-24 用户反馈「卡片左边的东西消失了」→ 报头入口从两枚恢复成三枚：
  //     背词 / 论文总览 / 学习笔记。论文总览页面本体已归档进 notes/papers.md，
  //     /papers.html 保留为自动跳转页（收藏的旧链接不失效）。
  ok('/ 首页报头三枚入口（带 base；五个 tab 都已目录化）',
     ways.join(',') === [BPATH + 'vocab/', BPATH + 'papers/', BPATH + 'notes/'].join(','),
     ways.join(',') || '未找到')

  // 1d) 栏目名（2026-10-08 用户定案：「词汇网页」→「词汇学习」，「单词听力」→「词汇朗读」）
  //     只改文案不改 URL/文件名，所以旧页面文件名里的「单词听力」不在检查范围内。
  const navTxt = await page.$$eval('.VPNavBarMenuLink', els => els.map(e => e.textContent.trim()))
  ok('顶栏栏目名＝词汇学习 + 词汇朗读',
     navTxt.includes('词汇学习') && navTxt.includes('词汇朗读'), navTxt.join('/'))
  // 2026-10-09 用户定案取消「总集」栏（三张总集页在 /vocab 与 /listen 顶部横幅里已能直达）
  ok('顶栏无「总集」栏（入口已并入两个索引页）', !navTxt.includes('总集'), navTxt.join('/'))

  // 1d-2) 顶栏照原型定制（2026-10-23 定案 §B7 → 2026-10-24 照原型还原 §B9）：
  //       黑块鲸鱼 logo + 双层站名 + 当前栏目胶囊高亮（底色 = 全站恒定的 signature 柠檬绿）
  ok('顶栏有黑块鲸鱼 logo', (await page.locator('.VPNavBarTitle .VPImage').count()) === 1)
  ok('顶栏双层站名（鲸读 + 副题）',
    (await page.locator('.VPNavBarTitle .st-big').textContent()) === '鲸读' &&
    (await page.locator('.VPNavBarTitle .st-sub').count()) === 1)
  // 胶囊底色必须等于真源 theme-defs.mjs 的 SIGNATURE['--dr-sig']（不是「非透明」这种弱判据，
  // 否则胶囊退化成任意颜色也照样过检）。真源是 ESM，这里读文件正则取，避免多一套加载逻辑。
  const sigHex = ((require('fs').readFileSync(
    require('path').resolve(__dirname, '../.vitepress/theme/theme-defs.mjs'), 'utf8')
    .match(/'--dr-sig':\s*'(#[0-9a-fA-F]{6})'/) || [])[1] || '').toLowerCase()
  const sigRgb = sigHex
    ? `rgb(${parseInt(sigHex.slice(1, 3), 16)}, ${parseInt(sigHex.slice(3, 5), 16)}, ${parseInt(sigHex.slice(5, 7), 16)})`
    : ''
  const act = page.locator('.VPNavBarMenuLink.active')
  const actBg = await act.first().evaluate((e) => getComputedStyle(e).backgroundColor)
  ok(`当前栏目「${navTxt[0]}」是胶囊高亮（signature 底 ${sigHex}）`,
    (await act.count()) === 1 && (await act.first().textContent()).trim() === navTxt[0] &&
    actBg !== 'rgba(0, 0, 0, 0)' && (!sigRgb || actBg === sigRgb), actBg)
  // 2026-10-24 §B9：原型顶栏没有搜索框（检索交给右端「找论文」弹窗），VitePress 自带的那个要藏掉。
  // 注意本地搜索的 ⌘K 只是按钮上写死的装饰字、没绑键盘事件，藏掉不丢功能。
  ok('顶栏无 VitePress 自带搜索框（照原型）',
    (await page.locator('.VPNavBarSearch').count()) === 0 ||
    !(await page.locator('.VPNavBarSearch').first().isVisible()))

  // 1e) 顶栏「模型架构」（2026-10-09 用户要求：站外链）+ 1e-2)「站外导航」（2026-10-23 新增）
  //     2026-10-24 用户要求「模型架构放在最右侧，也就是放在站外导航的右侧」——
  //     栏序变成 …学习笔记 / 站外导航 / 模型架构，「模型架构」回到最后一栏（§A2 原始位置）
  //     期望地址从 config.mts 里那一行常量现取，改地址不用改自检
  const CFG = require('fs').readFileSync(require('path').resolve(__dirname, '../.vitepress/config.mts'), 'utf8')
  const GALLERY = (CFG.match(/const LLM_GALLERY = '([^']+)'/) || [])[1]
  const gi = navTxt.indexOf('模型架构')
  const si = navTxt.indexOf('站外导航')
  ok('顶栏「站外导航」在倒数第二栏、「模型架构」在最后一栏（站内栏目都在它们左边）',
     si > 0 && gi === si + 1 && gi === navTxt.length - 1,
     navTxt.join('/'))
  const ext = page.locator('.VPNavBarMenuLink', { hasText: '模型架构' }).first()
  const extHref = await ext.getAttribute('href')
  const extTarget = await ext.getAttribute('target')
  ok('「模型架构」是站外链接：新标签打开、地址原样（query 与 #锚点都没被 base 加工）',
     !!GALLERY && extHref === GALLERY && extTarget === '_blank' &&
     /noreferrer/.test((await ext.getAttribute('rel')) || ''),
     (extHref || '未找到') + ' · target=' + extTarget)
  // 「站外导航」是站内页：带 base 的 .html，且不新标签打开
  const navLink = page.locator('.VPNavBarMenuLink', { hasText: '站外导航' }).first()
  const navHref = await navLink.getAttribute('href')
  ok('「站外导航」指向站内 /sites/（带 base，同标签打开）',
     navHref === BPATH + 'sites/' && !(await navLink.getAttribute('target')), navHref || '未找到')
  const bodyTxt = await page.locator('body').innerText()
  ok('首页无旧栏目名残留', !/词汇网页|单词听力/.test(bodyTxt),
     ['词汇网页', '单词听力'].filter(k => bodyTxt.includes(k)).join('、'))

  // 2) 搜索收敛（2026-10-23 改版：索引区的搜索框移到顶栏「找论文」弹窗）
  await page.click('.dr-find')
  await page.waitForTimeout(300)
  await page.fill('.sm-bar input', 'R1')
  await page.waitForTimeout(200)
  const afterSearch = await page.locator('.sm-item').count()
  ok('「找论文」输入 "R1" 收敛到少数', afterSearch >= 1 && afterSearch < NP, '剩 ' + afterSearch)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(250)
  ok('esc 关闭弹窗且解锁页面滚动',
     (await page.locator('.search-modal').count()) === 0 &&
     (await page.evaluate(() => document.body.style.overflow)) === '',
     'modal=' + (await page.locator('.search-modal').count()))

  // 3) 档位筛选已删（2026-10-08 用户定案：9/10 档全篇都有，筛了等于没筛）；只断言无残留
  ok('无级别胶囊/档位筛选残留',
    (await page.locator('.dr-lib .dr-bd, .dr-lib .dr-pill, .dr-tools select').count()) === 1,
    '应只剩 1 个排序下拉')

  // 3b) 排序下拉（2026-10-24 用户要求加「按时间」）：选项齐 + 切过去确实按 arXiv 号倒序
  const sortOpts = await page.$$eval('.dr-tools select option', els => els.map(e => e.textContent.trim()))
  ok('排序下拉三项齐全（编号 / 词数 / 时间）',
    sortOpts.length === 3 && sortOpts.includes('按编号') && sortOpts.includes('按词数') && sortOpts.includes('按时间（新→旧）'),
    sortOpts.join(' / '))
  const cardNums = () => page.$$eval('.dr-lib .dr-card-media', els =>
    els.map(e => (e.getAttribute('aria-label') || '').split('·')[0].trim()))
  await page.selectOption('.dr-tools select', 'time')
  await page.waitForTimeout(250)
  const timeSeq = await cardNums()
  // 期望顺序从 data/papers.json 现算（按 arXiv 号倒序），不写死编号，
  // 以后补新论文 / 调编号，这条断言都不用改
  const PAPERS = require('../data/papers.json')
  const wantSeq = PAPERS.slice()
    .sort((a, b) => String(b.arxiv || '').localeCompare(String(a.arxiv || '')))
    .map(p => p.num)
  ok('切「按时间」后 32 张卡按 arXiv 号倒序（最新在前）',
    JSON.stringify(timeSeq) === JSON.stringify(wantSeq),
    timeSeq.slice(0, 3).join(',') + ' … ' + timeSeq.slice(-2).join(','))
  await page.selectOption('.dr-tools select', 'num')   // 复位，别把时间序留给后面的断言
  await page.waitForTimeout(150)

  // 4) 顶栏「换背景」圆钮（2026-10-09 用户要求：不显示主题名文字，点一下就换）
  //    主题名单/顺序/默认项/哪套是暗色全从 theme-defs.mjs 现读，加配色不用改这里
  const { THEMES, DEFAULT_THEME } = await import(
    require('url').pathToFileURL(require('path').resolve(__dirname, '../.vitepress/theme/theme-defs.mjs')).href)
  const NTH = THEMES.length
  const KEYOF = (i) => '1234567890'[i]
  const did = () => page.evaluate(() => document.documentElement.getAttribute('data-theme'))
  const nameOf = (id) => (THEMES.find(t => t.id === id) || {}).name || id
  const di = THEMES.findIndex(t => t.id === DEFAULT_THEME)

  ok(`默认主题＝${nameOf(DEFAULT_THEME)}（共 ${NTH} 套）`, await did() === DEFAULT_THEME, await did())
  const btnTxt = (await page.locator('.pt-cycle').innerText()).trim()
  ok('换背景钮上不出现任何文字', btnTxt === '' && (await page.locator('.pt-cycle .pt-name').count()) === 0,
     btnTxt ? '实得文字：' + btnTxt : '无文字 · 仅有 aria-label/title')

  const nextId = THEMES[(di + 1) % NTH].id
  await page.click('.pt-cycle'); await page.waitForTimeout(150)
  ok(`点一下切到下一套（${nameOf(nextId)}）`, await did() === nextId, await did())
  await page.keyboard.down('Shift'); await page.click('.pt-cycle'); await page.keyboard.up('Shift')
  await page.waitForTimeout(150)
  ok(`shift+点击回上一套（${nameOf(DEFAULT_THEME)}）`, await did() === DEFAULT_THEME, await did())

  const darkIdx = THEMES.findIndex(t => t.dark)
  ok('主题里至少有一套暗色', darkIdx >= 0, darkIdx >= 0 ? nameOf(THEMES[darkIdx].id) : '全亮')
  await page.keyboard.press(KEYOF(darkIdx)); await page.waitForTimeout(200)
  const darkId = THEMES[darkIdx].id
  ok(`数字键 ${KEYOF(darkIdx)} 直达暗色（${nameOf(darkId)}）`, await did() === darkId, await did())
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
  ok('暗色主题 body 确实变暗', (() => { const m = bg.match(/\d+/g); return m && (+m[0] + +m[1] + +m[2]) < 200 })(), bg)
  await page.screenshot({ path: SHOT + `/02_首页_${darkId}.png` })
  await page.reload({ waitUntil: 'networkidle' })
  ok('刷新后记住主题', await did() === darkId, await did())
  // 回到默认主题，供后面几项截图用
  await page.keyboard.press(KEYOF(di)); await page.waitForTimeout(150)
  ok(`数字键 ${KEYOF(di)} 切回默认（${nameOf(DEFAULT_THEME)}）`, await did() === DEFAULT_THEME, await did())

  // 5) 点进静态词汇页：URL + title + 无站点外壳（DECISIONS §C1）
  //    卡片改版后卡面只显英文全名（无短名文本），按封面 aria-label 的编号前缀定位
  await page.click('.dr-lib .dr-card:has([aria-label^="01 ·"]) .dr-go.v')
  await page.waitForLoadState('networkidle')
  ok('跳进词汇页 URL', page.url().includes('/study/vocab/'), page.url())
  const hasShell = await page.evaluate(() => !!document.querySelector('.VPNav, .VPLocalNav, .VPSidebar, #app .VPDoc'))
  ok('词汇页为纯静态、无站点外壳', hasShell === false, 'shell=' + hasShell)
  ok('词汇页自身有内容（.card 或表格）', (await page.locator('body').count()) === 1)
  await page.screenshot({ path: SHOT + '/03_词汇页_静态.png' })

  // 6) 返回浮标：必须是相对路径，且点击真能落到索引页（根绝对路径在 Pages 子路径下会 404）
  const backHref = await page.locator('a:has-text("返回索引")').first().getAttribute('href')
  ok('词汇页返回浮标为相对路径', backHref === '../../vocab.html', backHref + '（旧地址，经根跳转粧到 /vocab/）')
  await page.click('a:has-text("返回索引")')
  await page.waitForLoadState('networkidle')
  ok('点浮标落到词汇学习索引页（经根跳转粧到 /vocab/）', page.url() === BASE + '/vocab/', page.url())
  await page.goBack()
  await page.waitForLoadState('networkidle')
  ok('回退出静态页', page.url().includes('/study/vocab/'), page.url())
  await page.goBack()
  await page.waitForLoadState('networkidle')
  ok('返回回到门户首页', page.url().replace(/\/$/, '') === BASE, page.url())

  // 7) /vocab /listen 专页
  await page.goto(BASE + '/vocab/', { waitUntil: 'networkidle' })
  const vocabBtns = await page.locator('.dr-lib .dr-go.v').count()
  const listenBtnsVocab = await page.locator('.dr-lib .dr-go.l').count()
  ok('/vocab 页只出词汇按钮', vocabBtns === NP && listenBtnsVocab === 0, `v=${vocabBtns} l=${listenBtnsVocab}`)
  ok('/vocab 页每卡也带第三枚「学习笔记」按钮', (await page.locator('.dr-lib .dr-go.n').count()) === NP)
  await page.screenshot({ path: SHOT + '/04_vocab页.png' })
  await page.goto(BASE + '/listen/', { waitUntil: 'networkidle' })
  ok('/listen 页只出听力按钮', (await page.locator('.dr-lib .dr-go.l').count()) === NP)
  // 总集入口两键平分（2026-10-08 用户要求；旧写法 main=flex:1 + alt=内容宽，实测 1148:154）
  const mm = await page.evaluate(() => {
    const m = document.querySelector('.dr-m-main'), a = document.querySelector('.dr-m-alt')
    return m && a ? [m.clientWidth, a.clientWidth] : null
  })
  ok('/listen 总集入口两键平分', !!mm && Math.abs(mm[0] - mm[1]) <= 2, mm ? mm.join(' : ') : '未找到两个按钮')

  // 7a) 听力页的返回按钮是 JS 跳转：有历史则 history.back()，没历史则 location.href="../../listen.html"。
  //     新标签里 Chromium 会把 about:blank 也算一条历史，点击测不到“无历史”分支，
  //     所以直接量相对路径的**解析结果**（这才是 base 会不会跑偏的判据），再补一条站内点击
  {
    const lp = await b.newPage({ viewport: { width: 1440, height: 900 } })
    const LISTEN0 = BASE + '/study/listen/' + encodeURIComponent('01_DeepSeek-LLM_单词听力.html')
    await lp.goto(LISTEN0, { waitUntil: 'domcontentloaded' })
    const resolved = await lp.evaluate(() => new URL('../../listen.html', location.href).href)
    ok('听力页相对返回路径解析到子路径内（不会逃到 站点根；经根跳转粧到 /listen/）', resolved === BASE + '/listen.html', resolved)
    // 从站内点进来（有上一历史）：同一个按钮应该 history.back()
    await lp.goto(BASE + '/listen/', { waitUntil: 'networkidle' })
    await lp.goto(LISTEN0, { waitUntil: 'domcontentloaded' })
    await lp.click('#backBtn')
    await lp.waitForLoadState('networkidle')
    ok('从站内进来→同一按钮走 history.back 回朗读索引（经根跳转粧到 /listen/）', lp.url() === BASE + '/listen/', lp.url())
    await lp.close()
  }

  // 7b) 论文总览（2026-10-25 升独立 tab：页面搬进 papers/ 文件夹，URL 变 /papers/；
  //     同日又按用户要求把长表拆成 /papers/清单.html——总览页只留卡片墙，
  //     不再「卡片之后又一整篇文章」）
  await page.goto(BASE + '/papers/index.html', { waitUntil: 'networkidle' })
  ok('论文总览页标题正确', (await page.locator('h1').first().textContent()).includes('论文总览'))
  const ovTables = await page.locator('.vp-doc table').count()
  ok('/papers 总览页只留卡片墙（无长表）', ovTables === 0, '实得 ' + ovTables + ' 张表')
  const ovCards = await page.locator('.dr-card.is-paper').count()
  ok('/papers 总览页卡片墙完整', ovCards >= 32, '实得 ' + ovCards + ' 张')
  await page.screenshot({ path: SHOT + '/05_papers页.png' })

  // 7b-1) 论文清单页（时间线 + 分主线表；从总览拆出来的长表）
  await page.goto(BASE + '/papers/清单.html', { waitUntil: 'networkidle' })
  const tables = await page.locator('.vp-doc table').count()
  ok('/papers 论文清单页表格渲染', tables >= 5, '实得 ' + tables + ' 张')
  // 链接名称不带下划线（2026-10-08 用户要求），悬停时才显
  const deco = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.vp-doc table a')).textDecorationLine)
  ok('/papers 清单页链接无下划线', deco === 'none', '实得 ' + deco)

  // 7b-2) 拆出的两页：官方发布 / 解读资源（2026-10-25 papers/ 文件夹里的专门页；同批还有 7b-1 的论文清单）
  await page.goto(BASE + '/papers/official.html', { waitUntil: 'networkidle' })
  ok('官方发布页有开源周表', (await page.locator('.vp-doc table').count()) >= 3,
    '实得 ' + (await page.locator('.vp-doc table').count()) + ' 张')
  await page.goto(BASE + '/papers/resources.html', { waitUntil: 'networkidle' })
  ok('解读资源页有外链清单', (await page.locator('.vp-doc a[href*="bilibili"], .vp-doc a[href*="youtube"], .vp-doc a[href*="zhihu"]').count()) >= 10,
    '实得 ' + (await page.locator('.vp-doc a[href*="bilibili"], .vp-doc a[href*="youtube"], .vp-doc a[href*="zhihu"]').count()) + ' 条')

  // 7c) 三张静态总集页（入口在 /vocab 与 /listen 顶部横幅；/master 站根页已于 2026-10-09 取消）
  //     探 404 用一个独立 page：故意访 404 会进 console，不能污染主页面的“0 报错”判定
  const probe = await b.newPage()
  const gone = await probe.goto(BASE + '/master.html', { waitUntil: 'domcontentloaded' })
  ok('/master 页已取消（返回 404，不留旧入口）', gone.status() === 404, 'HTTP ' + gone.status())
  await probe.close()

  const M = (f) => BASE + '/study/master/' + encodeURIComponent(f)
  await page.goto(M('词汇总集_去重.html'), { waitUntil: 'domcontentloaded' })
  ok(`词汇总集去重页：无站点外壳且 ${N_DEDUP} 行`,
    (await page.locator('.VPNav,.VPSidebar,#app .VPDoc').count()) === 0 &&
    (await page.locator('.theme-mag table tr').count()) === N_DEDUP,
    '行数 ' + await page.locator('.theme-mag table tr').count())
  ok('词汇总集去重页有返回浮标（相对路径指回词汇学习索引）',
    (await page.locator('a[href="../../vocab.html"]').count()) >= 1,
    'href命中=' + await page.locator('a[href="../../vocab.html"]').count()
    + ' · 文本命中=' + await page.locator('a:has-text("返回索引")').count()
    + ' · URL=' + page.url())
  await page.screenshot({ path: SHOT + '/12_词汇总集.png' })

  // 目录条配色只能跟「样式」（白天/夜晚/暖白），不能跟「视图」：
  // 旧 add_toc.py 把 body.lv-mode（按级别视图）当夜晚用，整条涂成黑块 → 用户报「黑乎乎看不清」
  await page.click('#v-lv')
  await page.waitForTimeout(250)
  const toc = await page.evaluate(() => {
    const L = c => { const [r, g, b] = c.match(/\d+/g).map(Number); return .2126 * r + .7152 * g + .0722 * b }
    const bar = getComputedStyle(document.querySelector('.toc-bar')).backgroundColor
    const body = getComputedStyle(document.body).backgroundColor
    const cap = getComputedStyle(document.querySelector('.toc-cap')).color
    const contra = (() => { const f = c => { const [r,g,b] = c.match(/\d+/g).map(Number)
      const h = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }
      return .2126 * h(r) + .7152 * h(g) + .0722 * h(b) }
      const [x, y] = [f(cap), f(bar)].sort((m, n) => n - m); return (x + .05) / (y + .05) })()
    return { same: (L(bar) > 128) === (L(body) > 128), contra: +contra.toFixed(1), bar, body }
  })
  ok('词汇总集：按级别视图下目录条与页面同明暗', toc.same, `条=${toc.bar} 页=${toc.body}`)
  ok('词汇总集：目录条文字对比度 ≥ 4.5', toc.contra >= 4.5, toc.contra + ':1')

  await page.goto(M('听力总集_全量连播.html'), { waitUntil: 'domcontentloaded' })
  const nAll = await page.evaluate(() => (typeof ITEMS !== 'undefined' ? ITEMS.length : -1))
  ok(`听力全量页 ITEMS=${N_ALL} 且 ${NP} 个章节范围`, nAll === N_ALL,
    'ITEMS=' + nAll)
  const rangeOpts = await page.locator('#rangeBox b').count()
  ok(`听力全量页 ☰ 范围按论文 ${NP} 选项`, rangeOpts === NP, '实得 ' + rangeOpts)

  await page.goto(M('听力总集_去重连播.html'), { waitUntil: 'domcontentloaded' })
  const nDedup = await page.evaluate(() => (typeof ITEMS !== 'undefined' ? ITEMS.length : -1))
  ok(`听力去重页 ITEMS=${N_DEDUP}`, nDedup === N_DEDUP, 'ITEMS=' + nDedup)
  await page.screenshot({ path: SHOT + '/13_听力总集.png' })

  // 7d) /notes 学习笔记索引（2026-10-09 新增栏目）：卡片、按钮、未写标记、空白页轻提示
  //     2026-10-25：学习笔记拆成三个子栏——全部笔记 /notes/ · 专题案例 /notes/cases/ · 每日一文 /notes/daily/。
  //     2026-10-26：顶栏「学习笔记」从下拉改回普通链接（指向 /notes/），子栏入口只在页内的 .dr-subtabs 条。
  //     原先挂在 /notes 末尾的「专题与索引」组整组搬到专题案例页。
  //     ⚠ 路径一律用显式 .html：本地 preview 会把 /notes/ 优先命中仓根的旧跳转桩 notes.md（notes.html），
  //       线上 GitHub Pages 是命中 notes/index.html（已核对线上）——两者不一致会造成 hydration 报警。
  await page.goto(BASE + '/notes/index.html', { waitUntil: 'networkidle' })
  const PP = require('../data/papers.json')
  const PAPER_CARD = '.dr-lib .dr-card.is-paper'
  ok(`/notes 页 ${NP} 卡 × 一枚「学习笔记」按钮`,
    (await page.locator(PAPER_CARD).count()) === NP && (await page.locator(PAPER_CARD + ' .dr-go.n').count()) === NP,
    `card=${await page.locator(PAPER_CARD).count()} n=${await page.locator(PAPER_CARD + ' .dr-go.n').count()}`)
  ok('/notes 页不再有专题卡（整组搬到专题案例页）',
    (await page.locator('.dr-lib .dr-card.is-topic').count()) === 0)
  const nbHref = await page.locator(PAPER_CARD).first().locator('.dr-go.n').getAttribute('href')
  ok('笔记按钮指向 /notes/<编号>_<短名>.html（带 base）',
    nbHref === BPATH + 'notes/' + PP[0].dir + '.html', nbHref)
  const nbCount = await page.locator('.dr-lib .dr-nb').count()
  ok('未写的篇目带「未写」小标（与空白文件数对平）', nbCount === PP.length - writtenNotes(PP), `标=${nbCount} 已写=${writtenNotes(PP)}`)
  await page.screenshot({ path: SHOT + '/28_notes索引.png' })

  // 7d-1) 顶栏「学习笔记」是普通链接（2026-10-26 用户定案去掉下拉）
  //   用户的理由：「默认应该就是全部笔记，不要让用户非得去下拉里选」——
  //   下拉父项只能当按钮（VitePress 的 link/items 二选一约束），点了只展开不跳转，
  //   想看全部笔记得点两下。现在直接链接 /notes/，子栏入口只留页内那一条。
  const notesNav = page.locator('.VPNavBarMenu .VPNavBarMenuLink', { hasText: '学习笔记' })
  ok('顶栏「学习笔记」是普通链接（不再有下拉）', (await notesNav.count()) === 1,
    '实得 ' + (await notesNav.count()) + ' 个')
  const notesNavHref = (await notesNav.count()) ? await notesNav.first().getAttribute('href') : ''
  ok('顶栏「学习笔记」直接指向 /notes/（全部笔记，带 base）',
    notesNavHref === BPATH + 'notes/', notesNavHref || '未找到')
  ok('顶栏不再有下拉菜单组（VPNavBarMenuGroup）',
    (await page.locator('.VPNavBarMenuGroup').count()) === 0,
    '实得 ' + (await page.locator('.VPNavBarMenuGroup').count()) + ' 个')

  // 7d-2) 页内子栏条（2026-10-26 改成两层：一级栏目纸签 + 二级分类纸带）
  for (const [label, p, nSub] of [
    ['全部笔记', '/notes/index.html', 7],
    ['专题案例', '/notes/cases/index.html', 4],
    ['每日一文', '/notes/daily/index.html', 3],
  ]) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const tabs = page.locator('.dr-subtabs .nt-l1 .nt-tab')
    const on = page.locator('.dr-subtabs .nt-l1 .nt-tab.is-on')
    ok(`${label} 页有子栏条（一级三项）`, (await tabs.count()) === 3, '实得 ' + (await tabs.count()))
    ok(`${label} 页当前子栏＝${label}`,
      (await on.count()) === 1 && (await on.first().innerText()).trim() === label,
      (await on.count()) ? (await on.first().innerText()).trim() : '无高亮')
    const subs = page.locator('.dr-subtabs .nt-l2 .nt-sub')
    ok(`${label} 页二级分类行有 ${nSub} 项`,
      (await subs.count()) === nSub, '实得 ' + (await subs.count()))
  }

  // 7d-2b) 二级分类真筛选：点分类 → URL 带 ?cat= → 卡墙只留这一类（2026-10-26）
  const NC = require('../data/note-cats.json')
  const nOf = (key) => PAPERS.filter((p) => p.category === key).length
  await page.goto(BASE + '/notes/index.html', { waitUntil: 'networkidle' })
  await page.waitForTimeout(300)
  ok('未筛选时 32 张论文卡全在',
    (await page.locator('.dr-grid > .dr-card:visible').count()) === PAPERS.length,
    '实得 ' + (await page.locator('.dr-grid > .dr-card:visible').count()))
  ok('二级分类带真实篇数（合计＝32）',
    NC.columns.notes.cats.reduce((a, c) => a + nOf(c.key), 0) === PAPERS.length &&
    (await page.locator('.dr-subtabs .nt-l2 .nt-n').count()) === NC.columns.notes.cats.length,
    '篇数合计 ' + NC.columns.notes.cats.reduce((a, c) => a + nOf(c.key), 0))
  await page.goto(BASE + '/notes/index.html?cat=mm', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  ok('?cat=mm 只剩多模态与视觉那几张卡',
    (await page.locator('.dr-grid > .dr-card:visible').count()) === nOf('mm'),
    '实得 ' + (await page.locator('.dr-grid > .dr-card:visible').count()) + '，应为 ' + nOf('mm'))
  ok('筛选态下二级对应项高亮',
    (await page.locator('.dr-subtabs .nt-l2 .nt-sub.is-on').count()) === 1 &&
    (await page.locator('.dr-subtabs .nt-l2 .nt-sub.is-on').innerText()).includes('多模态与视觉'))
  ok('筛选态有「正在看 … · 看全部」提示',
    (await page.locator('.dr-filter:visible').count()) === 1 &&
    (await page.locator('.dr-filter').innerText()).includes('多模态与视觉'))
  await page.goto(BASE + '/notes/cases/index.html?cat=edge', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)
  ok('专题页 ?cat=edge 只留边界与外推那几张卡',
    (await page.locator('.dr-grid > .dr-card:visible').count()) === 5,
    '实得 ' + (await page.locator('.dr-grid > .dr-card:visible').count()))

    // 7d-3) 专题案例页（网格卡墙：topics 顶层 md + zhuanti-search 总览与各子目录 index.md）
  //     卡源口径不变：notes/ 顶层不带 NN_ 前缀的 md + zhuanti-search 总览与各子目录 index.md，
  //     封面是 T_<coverFile>.png
  const notesDir = require('path').resolve(__dirname, '../notes')
  const zDir = require('path').resolve(notesDir, 'zhuanti-search')
  const fsx = require('fs')
  const topics = fsx.readdirSync(notesDir)
    .filter((f) => f.endsWith('.md') && !/^\d\d_/.test(f) && !['index.md', 'papers.md'].includes(f))
  const zTopics = (fsx.existsSync(zDir) ? fsx.readdirSync(zDir, { withFileTypes: true }) : [])
    .filter((d) => d.isDirectory() && fsx.existsSync(require('path').join(zDir, d.name, 'index.md'))).length
    + (fsx.existsSync(require('path').join(zDir, 'index.md')) ? 1 : 0)
  const nTopics = topics.length + zTopics
  await page.goto(BASE + '/notes/cases/index.html', { waitUntil: 'networkidle' })
  const topicCards = page.locator('.dr-lib .dr-card.is-topic')
  ok(`专题案例页 ${nTopics} 张专题卡（顶层专题 md + zhuanti-search 总览与子目录）`,
    (await topicCards.count()) === nTopics, '实得 ' + (await topicCards.count()) + ' 张')
  ok('专题案例页没有论文卡（那一栏只放专题）', (await page.locator(PAPER_CARD).count()) === 0)
  ok('专题案例页没有排序下拉（没有编号/词数可排）', (await page.locator('.dr-lib .dr-sort').count()) === 0)
  if (nTopics) {
    const leadHref = await topicCards.first().getAttribute('href')
    ok('专题卡首卡指向 /notes/ 下的页（带 base，不逃出子路径）',
      leadHref && leadHref.startsWith(BPATH + 'notes/'), leadHref || '未找到')
    const tHref = await topicCards.first().getAttribute('href')
    ok('专题卡指向 /notes/ 下的页（带 base；顶层 md 是 .html，专题子目录是目录地址）',
      /\/notes\/.+(\.html|\/)$/.test(tHref || '') && (tHref || '').startsWith(BPATH), tHref || '未找到')
    // 组内每一张的封面都要能加载（前面 32 篇论文卡另有一条「全带封面」的断言）
    const tCovs = await topicCards.locator('.dr-card-media').evaluateAll((els) => els.map((e) => e.style.backgroundImage))
    ok(`专题卡 ${nTopics} 张全带封面`, tCovs.length === nTopics && tCovs.every((s) => s.includes('/covers/T_')),
      '实得 ' + tCovs.length + ' 张')
    const tCode = await page.evaluate((u) => fetch(u).then((r) => r.status).catch(() => 0),
      (tCovs[0].match(/url\("?([^")]+)"?\)/) || [])[1])
    ok('专题卡封面图可加载（HTTP 200）', tCode === 200, tCode + '')
    // 专题封面也不能是黑底（2026-10-25 用户要求：卡片不要纯黑）
    const tTopPx = await page.evaluate(async (urls) => {
      const out = []
      for (const u of urls.slice(0, 4)) {
        const img = new Image(); img.src = u
        await img.decode()
        const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
        const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
        const d = ctx.getImageData(2, 2, 1, 1).data
        out.push([d[0], d[1], d[2]])
      }
      return out
    }, tCovs.map((s) => (s.match(/url\("?([^")]+)"?\)/) || [])[1]).filter(Boolean))
    ok('专题卡封面左上角不是黑色（实渲染取样）',
      tTopPx.length > 0 && tTopPx.every((p) => p[0] + p[1] + p[2] > 180), JSON.stringify(tTopPx.slice(0, 2)))
  }
  await page.screenshot({ path: SHOT + '/29_专题案例页.png' })

  // 7d-4) 每日一文：一条 md 一篇，列表条数与仓内文件数对平，且按日期倒序
  const dailyDir = require('path').resolve(notesDir, 'daily')
  const dailyFiles = fsx.existsSync(dailyDir)
    ? fsx.readdirSync(dailyDir).filter((f) => f.endsWith('.md') && f !== 'index.md') : []
  await page.goto(BASE + '/notes/daily/index.html', { waitUntil: 'networkidle' })
  const dailyRows = page.locator('.dr-daily .dr-daily-row')
  ok(`每日一文 ${dailyFiles.length} 条（notes/daily/*.md 一篇一条）`,
    (await dailyRows.count()) === dailyFiles.length, '实得 ' + (await dailyRows.count()) + ' 条')
  const days = (await dailyRows.locator('.dr-daily-date b').allInnerTexts()).map(Number)
  ok('每日一文按日期倒序（新的一天在上）',
    days.every((d, i) => i === 0 || days[i - 1] >= d), days.join(','))
  if (dailyFiles.length) {
    const firstHref = await dailyRows.first().getAttribute('href')
    ok('每日一文首条指向 /notes/daily/ 下的正文（带 base）',
      firstHref && firstHref.startsWith(BPATH + 'notes/daily/'), firstHref || '未找到')
  }
  await page.screenshot({ path: SHOT + '/29b_每日一文页.png' })

  // 7d-5) 社区大学（2026-10-26 用户要求新增的顶栏栏位，插在「学习笔记」右侧）
  //     收的是别人做的成系列解读，一辑一套，卡片直链站外原视频。
  //     期望数全部从 data/community.json 算，补一期二期不用改这里。
  const CD = require('../data/community.json')
  const cEps = CD.issues.reduce((a, i) => a + i.episodes.length, 0)
  /* 页面默认「最新」＝数据书写顺序的倒序（新辑往后追加 → 新辑排最前），
     下面所有逐辑逐集的期望都按这个渲染顺序算，别拿 issues[0] 当第一张。 */
  const ccOrder = [...CD.issues].reverse()
  /* 追加新辑最容易撞的两件事：同一条视频被收进两辑、封面文件名撞车。
     2026-10-28 收第肆辑（EZ-Encoder 14 集）时补的守卫，纯查数据不碰页面。 */
  const ccBvids = CD.issues.flatMap((i) => i.episodes.map((e) => e.bvid))
  ok(`${cEps} 集无一条重复收录（bvid 全站唯一）`,
    ccBvids.filter((v, k) => ccBvids.indexOf(v) !== k).length === 0,
    '撞车：' + ccBvids.filter((v, k) => ccBvids.indexOf(v) !== k).join(','))
  const ccCovers = CD.issues.flatMap((i) => i.episodes.map((e) => e.cover))
  ok('封面文件名全站唯一', new Set(ccCovers).size === ccCovers.length,
    '撞车：' + ccCovers.filter((v, k) => ccCovers.indexOf(v) !== k).join(','))
  ok('每辑内部封面同前缀（第 N 辑 → C<N>_xx）',
    CD.issues.every((i) => new Set(i.episodes.map((e) => (e.cover.match(/^C\d+_/) || [''])[0])).size === 1),
    CD.issues.map((i) => i.no + ':' + ((i.episodes[0].cover.match(/^C\d+_/) || ['?'])[0] || '?')).join(' '))
  /* 分篇（2026-10-28 用户定案 A 方案）：parts 里的集号必须存在、不重叠、每组至少 2 集。
     纯查数据不碰页面——写错一个集号，页面上就会少一张卡、弹窗里少一行，很隐蔽。 */
  ok('分篇（parts）集号都存在、不重叠、每组 ≥2 集',
    CD.issues.every((i) => {
      const nos = new Set(i.episodes.map((e) => e.no))
      const seen = new Set()
      for (const p of i.parts || []) {
        if (p.eps.length < 2) return false
        for (const no of p.eps) {
          if (!nos.has(no) || seen.has(no)) return false
          seen.add(no)
        }
      }
      return true
    }),
    CD.issues.map((i) => i.no + ':' + ((i.parts || []).map((p) => p.eps.join('')).join('+') || '—')).join(' '))
  await page.goto(BASE + '/notes/index.html', { waitUntil: 'networkidle' })
  const navTexts = (await page.locator('.VPNavBarMenu .VPNavBarMenuLink').allInnerTexts()).map((s) => s.trim())
  ok('顶栏「社区大学」紧跟在「学习笔记」右侧',
    navTexts.indexOf('社区大学') === navTexts.indexOf('学习笔记') + 1 && navTexts.includes('社区大学'),
    navTexts.join(' | '))
  const ccNav = page.locator('.VPNavBarMenu .VPNavBarMenuLink', { hasText: '社区大学' })
  ok('顶栏「社区大学」指向 /community/（带 base）',
    (await ccNav.first().getAttribute('href')) === BPATH + 'community/',
    (await ccNav.first().getAttribute('href')) || '未找到')

  await page.goto(BASE + '/community/index.html', { waitUntil: 'networkidle' })
  /* 分篇（2026-10-28 用户定案 A 方案）：有 parts 的辑，连载收成一张「代表卡」，点开弹窗才铺开子集。
     所以页面卡片数 = 组数 + 未分组的单集数，不再等于总集数；总集数的完整性交给下面的弹窗断言兜。 */
  const ccParts = CD.issues.flatMap((i) => (i.parts || []).map((p) => ({ ...p, iss: i })))
  const ccGroupedNos = (i) => new Set((i.parts || []).flatMap((p) => p.eps))
  const cSingles = CD.issues.reduce((a, i) => a + i.episodes.filter((e) => !ccGroupedNos(i).has(e.no)).length, 0)
  const cCards = ccParts.length + cSingles
  const ccCards = page.locator('.dr-lib.cc .cc-card')
  ok(`社区大学 ${cCards} 张卡（${ccParts.length} 张代表卡 + ${cSingles} 张单集，共 ${cEps} 集）`,
    (await ccCards.count()) === cCards, '实得 ' + (await ccCards.count()) + ' 张')
  ok(`社区大学 ${CD.issues.length} 枚期号纸签 + ${CD.issues.length} 块辑面板`,
    (await page.locator('.dr-lib.cc .cc-chip').count()) === CD.issues.length &&
    (await page.locator('.dr-lib.cc .cc-band').count()) === CD.issues.length)
  // 角标：单集卡「第 N 集 / 时长」，代表卡「共 N 集 / 总时长」——两行都在，但读的不是一回事
  ok('卡面角标齐（单集卡「第 N 集 / 时长」，代表卡「共 N 集 / 总时长」）',
    (await page.locator('.cc-bdg-l').count()) === cCards && (await page.locator('.cc-bdg-r').count()) === cCards,
    '左 ' + (await page.locator('.cc-bdg-l').count()) + ' 右 ' + (await page.locator('.cc-bdg-r').count()))
  const ccGroupLbl = await page.locator('.dr-lib.cc .cc-group .cc-bdg-l').allInnerTexts()
  ok(`代表卡左角标念「第 N 篇 · 合集 M 集」（${ccGroupLbl.length} 张）`,
    ccGroupLbl.length === ccParts.length && ccGroupLbl.every((t) => /^第 \d+ 篇 · 合集 \d+ 集$/.test(t.trim())),
    ccGroupLbl.join(' / '))
  /* 编号按「张」从 01 连续走到底（2026-10-28 用户要求）：合集只占一个号，
     不能因为一篇吃了 3 集就跳到 05——那样用户看着像缺号。
     ⚠ 必须按 CSS order 排出视觉顺序再读：DOM 里合集总在单集之前，
       直接按 DOM 读会把第壹辑读成 02,03,01。 */
  const ccSeqs = await page.evaluate(() => [...document.querySelectorAll('.dr-lib.cc .cc-issue')].map((sec) =>
    [...sec.querySelectorAll('.cc-strip .cc-bdg-l')]
      .map((b) => ({
        seq: (b.textContent.match(/第 (\d+)/) || [])[1],
        order: Number(getComputedStyle(b.closest('.cc-card')).order) || 0,
      }))
      .filter((x) => x.seq)
      .sort((a, b) => a.order - b.order)
      .map((x) => x.seq)))
  ok('每辑的卡片编号从 01 连续到 N，无跳号',
    ccSeqs.length === CD.issues.length && ccSeqs.every((list) =>
      list.length > 0 && list.every((n, i) => Number(n) === i + 1)),
    ccSeqs.map((l) => l.join(',')).join(' | '))
  /* 直链只查单集卡：代表卡是 <button>，点开的是弹窗，没有 href */
  const ccSingleLinks = await page.locator('.dr-lib.cc a.cc-card').evaluateAll((els) => els.map((e) => ({
    href: e.getAttribute('href'), target: e.getAttribute('target'), rel: e.getAttribute('rel'),
  })))
  const wantLinks = ccOrder.flatMap((i) => i.episodes
    .filter((e) => !ccGroupedNos(i).has(e.no))
    .map((e) => 'https://www.bilibili.com/video/' + e.bvid + '/'))
  ok(`每张单集卡（${wantLinks.length} 张）直链 data 里那条 B 站视频，顺序＝辑内观看顺序`,
    JSON.stringify(ccSingleLinks.map((l) => l.href)) === JSON.stringify(wantLinks),
    (ccSingleLinks[0] || {}).href || '未找到')
  ok('外部卡一律新标签打开且带 rel=noreferrer',
    ccSingleLinks.length > 0 && ccSingleLinks.every((l) => l.target === '_blank' && /noreferrer/.test(l.rel || '')))
  const ccCovs = await ccCards.locator('.dr-card-media').evaluateAll((els) => els.map((e) => e.style.backgroundImage))
  ok('社区大学卡全带封面（代表卡用该篇首集的封面）',
    ccCovs.length === cCards && ccCovs.every((s) => /\/covers\/C\d+_\d+\.png/.test(s)), ccCovs[0] || '未找到')
  const ccCovUrls = ccCovs.map((s) => (s.match(/url\("?([^")]+)"?\)/) || [])[1]).filter(Boolean)
  const ccCovCode = await page.evaluate((urls) => Promise.all(urls.map((u) => fetch(u).then((r) => r.status))), ccCovUrls)
  ok('社区大学封面全部可加载（HTTP 200）', ccCovCode.every((s) => s === 200), ccCovCode.join(','))
  const ccTopPx = await page.evaluate(async (urls) => {
    const out = []
    for (const u of urls) {
      const img = new Image(); img.src = u
      await img.decode()
      const c = document.createElement('canvas'); c.width = img.width; c.height = img.height
      const ctx = c.getContext('2d'); ctx.drawImage(img, 0, 0)
      const d = ctx.getImageData(2, 2, 1, 1).data
      out.push([d[0], d[1], d[2]])
    }
    return out
  }, ccCovUrls)
  ok('社区大学封面左上角不是黑色（实渲染取样）',
    ccTopPx.length === cCards && ccTopPx.every((p) => p[0] + p[1] + p[2] > 180), JSON.stringify(ccTopPx.slice(0, 2)))
  const ccChips = (await page.locator('.dr-lib.cc .cc-chip').allInnerTexts())
    .map((s) => s.replace(/\s+/g, ' '))
  ok(`每枚纸签（共 ${ccOrder.length} 枚）都念全「辑名（共 N 集）总时长」+ 期号，且按最新在上排`,
    ccChips.length === ccOrder.length && ccChips.every((t, k) => {
      const iss = ccOrder[k]
      return t.includes(iss.title) && t.includes(`（共 ${iss.episodes.length} 集）`) &&
        /小时|分钟/.test(t) && t.includes(iss.no)
    }), ccChips.join(' ‖ '))
  const ccLines = await page.locator('.dr-lib.cc .cc-line').allInnerTexts()
  ok('每块辑面板头都不重复自己那辑的辑名，只留一行主线',
    ccLines.length === ccOrder.length && ccLines.every((t, k) => {
      const iss = ccOrder[k]
      return t.includes(iss.sub) && !t.includes(iss.title)
    }), ccLines.map((s) => s.slice(0, 14) + '…').join(' ‖ '))
  ok('页头统计行已撤（跟纸签完全重复）', (await page.locator('.dr-lib.cc .cc-stat').count()) === 0)

  // 「最新 / 最早」排序钮（2026-10-26 用户按参考图要求加，**只排「辑」这一层**，辑里的集恒按观看顺序）
  const ccSorts = page.locator('.cc-sort .cc-sort-o')
  ok('排序钮两项＝最新 / 最早（形态照用户给的参考图：文字 + 竖线，不做边框不做底色）',
    (await ccSorts.count()) === 2 && (await ccSorts.first().innerText()) === '最新'
    && (await ccSorts.nth(1).innerText()) === '最早')
  ok('默认「最新」高亮（最近添加那辑在上）',
    (await page.locator('.cc-sort-o.is-on').count()) === 1
    && (await page.locator('.cc-sort-o.is-on').innerText()) === '最新')
  await ccSorts.nth(1).click()
  await page.waitForTimeout(250)
  ok('点「最早」切过去且只有一项高亮（辑序整体反过来）',
    (await page.locator('.cc-sort-o.is-on').innerText()) === '最早'
    && (await page.locator('.cc-issue').count()) === CD.issues.length,
    '当前 ' + CD.issues.length + ' 辑；两辑以上翻序由 verify_sort.mjs 实测过')
  const nosOf = async () => (await page.locator('.cc-chip-no').allInnerTexts()).map((s) => s.trim())
  ok('点「最早」后辑序真的翻过来（第壹辑排到最前）',
    JSON.stringify(await nosOf()) === JSON.stringify(CD.issues.map((i) => i.no)),
    (await nosOf()).join(' → '))
  /* 辑内卡序：合集要留在它首集的位置上（第壹辑第 1 集是单集，合集是 2.1–2.3，
     合集被提到最前就把观看顺序打乱了）。视觉顺序由 CSS order 决定，按 order 排完再看 data-no。 */
  const seqAfter = await page.locator('.cc-issue').first().locator('.cc-card').evaluateAll((els) => els.map((e) => ({
    no: e.getAttribute('data-no'), order: Number(getComputedStyle(e).order) || 0,
  })))
  const visualOrder = [...seqAfter].sort((a, b) => a.order - b.order)
  ok('排序不动辑内卡序（按首集原始集号升序，合集不被提到最前）',
    seqAfter.length > 0 && visualOrder.every((c, i) => i === 0 || Number(visualOrder[i - 1].no) < Number(c.no)),
    visualOrder.map((c) => c.no).join(','))
  ok('辑内第一张卡就是该辑第 1 集',
    visualOrder.length > 0 && visualOrder[0].no === CD.issues[0].episodes[0].no,
    visualOrder[0] ? visualOrder[0].no : '未找到')
  await ccSorts.first().click()
  await page.waitForTimeout(250)
  ok('点回「最新」可逆（又变成最近添加那辑在上）',
    (await page.locator('.cc-sort-o.is-on').innerText()) === '最新'
    && JSON.stringify(await nosOf()) === JSON.stringify(ccOrder.map((i) => i.no)),
    (await nosOf()).join(' → '))
  // 分篇弹窗（2026-10-28 A 方案）：点代表卡 → 纸片列出这一篇全部子集，页面高度一点不动
  const headPart = (ccOrder[0].parts || [])[0]
  ok('最新那辑带分篇数据（第一张代表卡可点）', !!headPart, ccOrder[0].no)
  if (headPart) {
    const pageH0 = await page.evaluate(() => document.body.scrollHeight)
    await page.locator('.dr-lib.cc .cc-group').first().click()
    await page.waitForTimeout(400)
    const dlgTitle = (await page.locator('.cc-dlg-name').innerText()).trim()
    const dlgRows = await page.locator('.cc-dlg-list li').count()
    const pageH1 = await page.evaluate(() => document.body.scrollHeight)
    ok(`点代表卡弹出纸片：标题是篇名，清单行数＝该篇集数（${headPart.eps.length}）`,
      dlgTitle === headPart.name && dlgRows === headPart.eps.length, `标题「${dlgTitle}」行 ${dlgRows}`)
    ok('弹窗打开不推动页面（body 高度不变）', pageH0 === pageH1, `${pageH0}px → ${pageH1}px`)
    /* 2026-10-29 用户报「学习笔记 tab 点不了」：遮罩 z-index 1000 把 fixed 顶栏一起罩住，
       弹窗开着时顶栏任何入口都点不动。遮罩上沿改成从 --vp-nav-height 之下开始。 */
    const navHit = await page.evaluate(() => {
      const el = document.elementFromPoint(600, 30)
      return { cls: (el && (el.className || '')) + '', inNav: !!(el && el.closest && el.closest('.VPNav')),
        masked: !!(el && el.classList && el.classList.contains('cc-dlg-mask')) }
    })
    ok('弹窗打开时顶栏导航仍可点（遮罩不盖顶栏）',
      navHit.inNav && !navHit.masked, JSON.stringify(navHit))
    ok('弹窗打开时锁住背景滚动',
      (await page.evaluate(() => document.body.style.overflow)) === 'hidden')
    const dlgHrefs = await page.locator('.cc-dlg-list li a').evaluateAll((els) => els.map((e) => ({
      href: e.getAttribute('href'), target: e.getAttribute('target'), rel: e.getAttribute('rel'),
    })))
    const wantPart = headPart.eps.map((no) =>
      'https://www.bilibili.com/video/' + ccOrder[0].episodes.find((e) => e.no === no).bvid + '/')
    ok('弹窗每行直链该集 B 站视频、新标签 + noreferrer',
      JSON.stringify(dlgHrefs.map((l) => l.href)) === JSON.stringify(wantPart) &&
      dlgHrefs.every((l) => l.target === '_blank' && /noreferrer/.test(l.rel || '')),
      dlgHrefs[0] ? dlgHrefs[0].href : '未找到')
    await page.keyboard.press('Escape')
    await page.waitForTimeout(300)
    ok('Esc 关掉弹窗且复原滚动锁',
      (await page.locator('.cc-dlg').count()) === 0 &&
      (await page.evaluate(() => document.body.style.overflow)) === '')
  }
  await page.screenshot({ path: SHOT + '/29c_社区大学页.png' })

  await page.goto(BASE + '/notes/index.html', { waitUntil: 'networkidle' })
  await page.click('.dr-lib .dr-card:has([aria-label^="' + PP[0].num + ' ·"]) .dr-go.n')
  await page.waitForLoadState('networkidle')
  ok('点进笔记页 URL', page.url() === BASE + '/notes/' + PP[0].dir + '.html', page.url())
  ok('笔记页是站内页（有顶栏外壳，区别于 /study/ 静态页）', (await page.locator('.VPNav').count()) === 1)
  ok('笔记页标题带篇名', (await page.title()).includes(PP[0].short), await page.title())
  // 轻提示只在正文为空时出现；32 篇笔记全部写完后这条要跳过而不是判失败
  const bodyEmpty = await page.evaluate(() => {
    const el = document.querySelector('.note-page .vp-doc > div')
    return !!el && el.textContent.trim() === ''
  })
  const hint = bodyEmpty
    ? await page.evaluate(() => getComputedStyle(document.querySelector('.note-page .vp-doc > div'), '::after').content)
    : ''
  ok(bodyEmpty ? '空白笔记页显示一行轻提示' : '笔记正文已写满，轻提示断言跳过（当前无空白页）',
     bodyEmpty ? /还没有写笔记/.test(hint) : true, bodyEmpty ? hint.slice(0, 30) : 'skip')
  await page.screenshot({ path: SHOT + '/29_空白笔记页.png' })
  // 页头由主题层 NoteHeader.vue 按 URL 反查 papers.json 补（md 里不写一个字节）
  const hdNm = await page.locator('.dr-note-hd .dr-note-txt b').first().textContent()
  const hdNum = await page.locator('.dr-note-hd .dr-note-num').first().textContent()
  ok('笔记页页头带编号＋论文名（空白页也不像白屏）',
    hdNm.trim() === PP[0].short && hdNum.trim() === PP[0].num, `${hdNum} ${hdNm}`)
  await page.click('.dr-note-back')
  // SPA 切页不发网络请求，networkidle 会立刻返回——页头是响应式拆掉的，得等它真离开 DOM
  await page.waitForSelector('.dr-note-hd', { state: 'detached', timeout: 5000 }).catch(() => {})
  await page.waitForLoadState('networkidle')
  ok('点页头「← 笔记索引」回 /notes（带 base，不逃到站点根）', page.url() === BASE + '/notes/', page.url())
  ok('页头只跟着笔记页（索引页无、SPA 切走后也会拆掉）',
    (await page.locator('.dr-note-hd').count()) === 0)

  // 7e) /sites 站外导航页（2026-10-23 用户要求：顶栏「模型架构」右边加一栏，
  //     页面用「方案 C · 积木墙」把外站砌成一面墙）。清单在 data/sites.json，自检也从那儿读
  //     （数量全部动态读，加站不用改这里）
  const SITES = require('../sites/sites.json')
  await page.goto(BASE + '/sites.html', { waitUntil: 'networkidle' })
  const nBlk = await page.locator('.dr-nav .nav-blk:not(.ghost)').count()
  const nGhost = await page.locator('.dr-nav .nav-blk.ghost').count()
  const nPlate = await page.locator('.dr-nav .nav-plate').count()
  ok(`/sites 页 ${SITES.sites.length} 块实砖 + ${SITES.slots.length} 个空位 + ${SITES.groups.length} 块组牌`,
     nBlk === SITES.sites.length && nGhost === SITES.slots.length && nPlate === SITES.groups.length,
     `实砖=${nBlk} 空位=${nGhost} 组牌=${nPlate}`)
  // 每块都是站外链：新标签 + noreferrer + 地址与清单逐一对应
  const hrefs = await page.$$eval('.dr-nav .nav-blk:not(.ghost)',
    els => els.map(e => [e.getAttribute('href'), e.getAttribute('target'), e.getAttribute('rel') || '']))
  const wantHref = SITES.sites.map(s => s.url)
  const badLink = hrefs.filter((h, i) => h[0] !== wantHref[i] || h[1] !== '_blank' || !/noreferrer/.test(h[2]))
  ok('/sites 每块都是站外链（新标签 + noreferrer，地址与清单逐一对应）',
     hrefs.length === wantHref.length && badLink.length === 0,
     badLink.length ? badLink.slice(0, 3).map(b => b[0]).join(',') : `${hrefs.length} 块全对`)
  // 每站一枚 logo 全部加载（logo 在 public/logos/，缺一个就是碎图）
  const imgOK = await page.$$eval('.dr-nav .nav-blk img', els => els.filter(e => e.naturalWidth > 0).length)
  ok(`/sites ${SITES.sites.length} 枚 logo 全部加载成功`, imgOK === SITES.sites.length,
     `实得 ${imgOK}/${SITES.sites.length}`)
  // 待选站只留数据、不渲染（DECISIONS §A7）
  const navTxt2 = await page.locator('.dr-nav').innerText()
  const pendHit = SITES.pending.filter(p => navTxt2.includes(p.name))
  ok('/sites 不渲染待选站（数据保留、正式站不上墙）', pendHit.length === 0, pendHit.join(',') || '无')
  // 砖面文字对比度：块底色是褪色品牌色，文字统一近黑，必须 ≥ 4.5:1
  const contra = await page.$$eval('.dr-nav .nav-blk:not(.ghost)', els => els.map(e => {
    const c = getComputedStyle(e)
    const f = s => { const [r, g, b] = s.match(/[\d.]+/g).map(Number)
      const h = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4) }
      return .2126 * h(r) + .7152 * h(g) + .0722 * h(b) }
    const L1 = f(c.color), L2 = f(c.backgroundColor)
    const [x, y] = [L1, L2].sort((m, n) => n - m)
    return +((x + .05) / (y + .05)).toFixed(2)
  }))
  ok('/sites 砖面文字对比度 ≥ 4.5', Math.min(...contra) >= 4.5,
     `最低 ${Math.min(...contra)}:1（${contra.filter(c => c < 4.5).length} 块不达标）`)
  await page.screenshot({ path: SHOT + '/30_站外导航页.png', fullPage: true })

  // 8b) 门户五页禁词：内部口径/勘误/工作区痕迹一律不上页面（2026-10-08 用户两次要求；/master 已取消）
  //     只管门户外壳；/study/ 下静态词页的副标题（“全量口径重做 · 十一档 + 超纲”）同期定案暂不动
  // 2026-10-09 追加：静态笔记页（不在 /study/ 下的站内页）也拉进来扫同一张黑名单
  const BANNED = ['十一档', '全量重做', '全量口径', '双视图', 'TTS', '工作区',
    '本次补录', '漏收', 'sitemap', '剔除记录', '归属更正', '此前记录有误', '档位筛选']
  const PAGES = ['/', '/vocab/', '/listen/', '/papers/index.html', '/papers/清单.html', '/papers/official.html', '/papers/resources.html',
    '/notes/index.html', '/notes/cases/index.html', '/notes/daily/index.html', '/community/', '/sites/',
    '/notes/' + PP[0].dir + '.html']
  for (const p of PAGES) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' })
    const txt = await page.evaluate(() => document.body.innerText)
    const hit = BANNED.filter(w => txt.includes(w))
    ok(`${p} 无内部黑话`, hit.length === 0, '命中 ' + hit.join(','))
  }

  // 8c) 笔记栏目专门：「怎么写笔记」这类仓库操作说明不属于站点（2026-10-09 用户要求）。
  //     不开全站的「仓库/npm run」黑名单：论文总览页里「视频/资料聚合仓库」是在介绍外部 GitHub 仓库，那是正当正文
  const AUTHORING = ['npm run', 'notes/', 'papers.json', 'frontmatter', '构建']
  for (const p of ['/notes/index.html', '/notes/' + PP[0].dir + '.html']) {
    await page.goto(BASE + p, { waitUntil: 'networkidle' })
    const txt = await page.evaluate(() => document.body.innerText)
    const hit = AUTHORING.filter(w => txt.includes(w))
    ok(`${p} 无作者向操作说明`, hit.length === 0, '命中 ' + hit.join(','))
  }

  // 8) 子路径下不能有根绝对链接漏网：href="/xxx" 会跳出 /deepseek-words/ 打到用户站 404
  {
    const leaks = []
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'networkidle' })
      const bad = await page.evaluate((bp) =>
        [...document.querySelectorAll('a[href^="/"]')]
          .map(a => a.getAttribute('href')).filter(h => !h.startsWith(bp)), BPATH)
      if (bad.length) leaks.push(p + ' → ' + [...new Set(bad)].slice(0, 3).join(','))
    }
    ok('门户五页无根绝对链接漏网', leaks.length === 0, leaks.join(' | '))
  }

  // 9) 控制台报错
  //    「Hydration completed but contains mismatches.」是**本地 preview 特有的噪音**：
  //    仓根为旧 .html 地址留了跳转桩（notes.md / vocab.md / listen.md / papers.md / sites.md），
  //    preview 伺服器把目录地址（/vocab/）优先命中同名桩（vocab.html）——SSR 出的是桩的内容，
  //    客户端路由又渲染真页面 → 必然 mismatch。
  //    线上 GitHub Pages 命中的是 <dir>/index.html（已核对线上），没有这现象。
  //    所以这里只把这一条过滤掉，其余报错照旧判失败。
  const realErrs = errors.filter((e) => !/Hydration completed but contains mismatches/.test(e))
  ok('控制台 0 报错（hydration mismatch 除外，见注）', realErrs.length === 0, realErrs.slice(0, 3).join(' | '))

  await b.close()
  const failed = results.filter(r => !r.pass)
  console.log(`\n==== ${results.length - failed.length}/${results.length} 通过 ====`)
  process.exit(failed.length ? 1 : 0)
})().catch(e => { console.error('脚本异常', e); process.exit(2) })
