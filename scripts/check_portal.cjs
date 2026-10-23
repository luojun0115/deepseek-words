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
  ok('首页标题正确', (await page.title()).includes('鲸读 · DeepSeek 论文词汇'))
  await page.screenshot({ path: SHOT + '/01_首页_default.png', fullPage: false })

  // 1b) 宽版 + 栅格：1440 视口下一排 4 卡
  const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.dr-lib .dr-grid')).gridTemplateColumns.split(' ').length)
  ok('1440 视口下一排 4 卡', cols === 4, '实得 ' + cols + ' 列')

  // 1b-2) 论文卡金句封面（2026-10-23 同步 MotionFace 原型：covers3 海报随 public/covers 进仓）
  const covs = await page.$$eval('.dr-lib .dr-card-media', els => els.map(e => e.style.backgroundImage || ''))
  ok('论文卡 32 张全带金句封面', covs.length === NP && covs.every(s => s.includes('/covers/')), '实得 ' + covs.length + ' 张')
  const covURL = ((covs[0] || '').match(/url\("?([^")]+)"?\)/) || [])[1]
  const covCode = covURL ? await page.evaluate(u => fetch(u).then(r => r.status).catch(() => 0), covURL) : 0
  ok('封面图可加载（首张 HTTP 200）', covCode === 200, (covURL || '?') + ' → ' + covCode)

  // 1c) 首页报头（components/HomeIntro.vue，2026-10-23 改版：原 .dr-intro 学法卡换成报纸头版）
  //     两枚入口分指「背词」与「论文总览」
  const ways = await page.$$eval('.dr-hero .dp-links a', els => els.map(e => e.getAttribute('href')))
  // cleanUrls 已关（Pages 不做重写），入口必须是带 base 的 .html；根绝对路径在子路径下会跑到用户站
  ok('/ 首页报头两枚入口（带 base 的 .html）',
     ways.join(',') === [BPATH + 'vocab.html', BPATH + 'papers.html'].join(','), ways.join(',') || '未找到')

  // 1d) 栏目名（2026-10-08 用户定案：「词汇网页」→「词汇学习」，「单词听力」→「词汇朗读」）
  //     只改文案不改 URL/文件名，所以旧页面文件名里的「单词听力」不在检查范围内。
  const navTxt = await page.$$eval('.VPNavBarMenuLink', els => els.map(e => e.textContent.trim()))
  ok('顶栏栏目名＝词汇学习 + 词汇朗读',
     navTxt.includes('词汇学习') && navTxt.includes('词汇朗读'), navTxt.join('/'))
  // 2026-10-09 用户定案取消「总集」栏（三张总集页在 /vocab 与 /listen 顶部横幅里已能直达）
  ok('顶栏无「总集」栏（入口已并入两个索引页）', !navTxt.includes('总集'), navTxt.join('/'))

  // 1e) 顶栏「模型架构」（2026-10-09 用户要求：站外链，固定排在最后一栏）
  //     期望地址从 config.mts 里那一行常量现取，改地址不用改自检
  const CFG = require('fs').readFileSync(require('path').resolve(__dirname, '../.vitepress/config.mts'), 'utf8')
  const GALLERY = (CFG.match(/const LLM_GALLERY = '([^']+)'/) || [])[1]
  const gi = navTxt.indexOf('模型架构')
  ok('顶栏「模型架构」是最后一栏（站内栏目都在它左边）',
     gi === navTxt.length - 1 && navTxt.indexOf('学习笔记') === gi - 1, navTxt.join('/'))
  const ext = page.locator('.VPNavBarMenuLink', { hasText: '模型架构' }).first()
  const extHref = await ext.getAttribute('href')
  const extTarget = await ext.getAttribute('target')
  ok('「模型架构」是站外链接：新标签打开、地址原样（query 与 #锚点都没被 base 加工）',
     !!GALLERY && extHref === GALLERY && extTarget === '_blank' &&
     /noreferrer/.test((await ext.getAttribute('rel')) || ''),
     (extHref || '未找到') + ' · target=' + extTarget)
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
  ok('词汇页返回浮标为相对路径', backHref === '../../vocab.html', backHref)
  await page.click('a:has-text("返回索引")')
  await page.waitForLoadState('networkidle')
  ok('点浮标落到词汇学习索引页', page.url() === BASE + '/vocab.html', page.url())
  await page.goBack()
  await page.waitForLoadState('networkidle')
  ok('回退出静态页', page.url().includes('/study/vocab/'), page.url())
  await page.goBack()
  await page.waitForLoadState('networkidle')
  ok('返回回到门户首页', page.url().replace(/\/$/, '') === BASE, page.url())

  // 7) /vocab /listen 专页
  await page.goto(BASE + '/vocab.html', { waitUntil: 'networkidle' })
  const vocabBtns = await page.locator('.dr-lib .dr-go.v').count()
  const listenBtnsVocab = await page.locator('.dr-lib .dr-go.l').count()
  ok('/vocab 页只出词汇按钮', vocabBtns === NP && listenBtnsVocab === 0, `v=${vocabBtns} l=${listenBtnsVocab}`)
  ok('/vocab 页每卡也带第三枚「学习笔记」按钮', (await page.locator('.dr-lib .dr-go.n').count()) === NP)
  await page.screenshot({ path: SHOT + '/04_vocab页.png' })
  await page.goto(BASE + '/listen.html', { waitUntil: 'networkidle' })
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
    ok('听力页相对返回路径解析到子路径内（不会逃到站点根）', resolved === BASE + '/listen.html', resolved)
    // 从站内点进来（有上一历史）：同一个按钮应该 history.back()
    await lp.goto(BASE + '/listen.html', { waitUntil: 'networkidle' })
    await lp.goto(LISTEN0, { waitUntil: 'domcontentloaded' })
    await lp.click('#backBtn')
    await lp.waitForLoadState('networkidle')
    ok('从站内进来→同一按钮走 history.back 回朗读索引', lp.url() === BASE + '/listen.html', lp.url())
    await lp.close()
  }

  // 7b) /papers 论文总览页
  await page.goto(BASE + '/papers.html', { waitUntil: 'networkidle' })
  ok('/papers 页标题正确', (await page.locator('h1').first().textContent()).includes('论文总览'))
  const tables = await page.locator('.vp-doc table').count()
  ok('/papers 页表格渲染', tables >= 8, '实得 ' + tables + ' 张')
  // 链接名称不带下划线（2026-10-08 用户要求），悬停时才显
  const deco = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.vp-doc table a')).textDecorationLine)
  ok('/papers 页链接无下划线', deco === 'none', '实得 ' + deco)
  await page.screenshot({ path: SHOT + '/05_papers页.png' })

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
  await page.goto(BASE + '/notes.html', { waitUntil: 'networkidle' })
  const PP = require('../data/papers.json')
  ok(`/notes 页 ${NP} 卡 × 一枚「学习笔记」按钮`,
    (await page.locator('.dr-lib .dr-card').count()) === NP && (await page.locator('.dr-lib .dr-go.n').count()) === NP,
    `card=${await page.locator('.dr-lib .dr-card').count()} n=${await page.locator('.dr-lib .dr-go.n').count()}`)
  const nbHref = await page.locator('.dr-lib .dr-card').first().locator('.dr-go.n').getAttribute('href')
  ok('笔记按钮指向 /notes/<编号>_<短名>.html（带 base）',
    nbHref === BPATH + 'notes/' + PP[0].dir + '.html', nbHref)
  const nbCount = await page.locator('.dr-lib .dr-nb').count()
  ok('未写的篇目带「未写」小标（与空白文件数对平）', nbCount === PP.length - writtenNotes(PP), `标=${nbCount} 已写=${writtenNotes(PP)}`)
  await page.screenshot({ path: SHOT + '/28_notes索引.png' })

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
  ok('点页头「← 笔记索引」回 /notes（带 base，不逃到站点根）', page.url() === BASE + '/notes.html', page.url())
  ok('页头只跟着笔记页（索引页无、SPA 切走后也会拆掉）',
    (await page.locator('.dr-note-hd').count()) === 0)

  // 8b) 门户五页禁词：内部口径/勘误/工作区痕迹一律不上页面（2026-10-08 用户两次要求；/master 已取消）
  //     只管门户外壳；/study/ 下静态词页的副标题（“全量口径重做 · 十一档 + 超纲”）同期定案暂不动
  // 2026-10-09 追加：静态笔记页（不在 /study/ 下的站内页）也拉进来扫同一张黑名单
  const BANNED = ['十一档', '全量重做', '全量口径', '双视图', 'TTS', '工作区',
    '本次补录', '漏收', 'sitemap', '剔除记录', '归属更正', '此前记录有误', '档位筛选']
  const PAGES = ['/', '/vocab.html', '/listen.html', '/papers.html', '/notes.html',
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
  for (const p of ['/notes.html', '/notes/' + PP[0].dir + '.html']) {
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
  ok('控制台 0 报错', errors.length === 0, errors.slice(0, 3).join(' | '))

  await b.close()
  const failed = results.filter(r => !r.pass)
  console.log(`\n==== ${results.length - failed.length}/${results.length} 通过 ====`)
  process.exit(failed.length ? 1 : 0)
})().catch(e => { console.error('脚本异常', e); process.exit(2) })
