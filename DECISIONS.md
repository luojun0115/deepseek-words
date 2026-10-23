# 决策台账与参考手册

本仓库的**深度参考**：定案过程（用户提了什么 → 怎么定的 → 落地在哪 → 自检断言叫什么）、机制性坑、部署与门禁。

- **[README.md](README.md) 是薄入口**：只讲“这是什么、怎么用、怎么跑、怎么部署、改哪里”。参考性内容一律不在那儿重复，
  想知道“为什么这么定 / 门禁与部署细节 / 目录与命令全集”都在这里。
- 增补规则：新栏目 / 新样式定案后**追加一条**，写在对应主题小节末尾。条目号（A1/B3/C3…）一旦写定**不重排**——
  源码注释、`deploy.yml`、工作区 `PIPELINE.md` 都用 `DECISIONS §C1` 这种形式跨文档指它，移动或改名条目必须同步 grep 全仓跟改指针。
- 面向读者的页面（`/papers` 与五张门户页）**不放这些内部留痕**，台账只写这里与工作区 `PIPELINE.md`。
- 本文件与 `README.md` 都在 `config.mts` 的 `srcExclude` 里，不会被 VitePress 编译成站点页。

| 想知道 | 看哪章 |
|---|---|
| 某个栏目为什么长这样（总集删了、笔记怎么判空…）| §A 站点结构与栏目演进 |
| 某条样式/交互是谁定的、断言叫什么 | §B 页面与样式定案 |
| 撞上诡异的编译/样式/链接行为 | §C 机制性坑 |
| 部署、五道门禁、为什么内容在仓内 | §D 部署、门禁与内容自足 |
| 目录树、脚本清单、命令全集、任务该改哪个文件 | §D5 |

---

## A. 站点结构与栏目演进

### A1. 顶栏取消「总集」栏（2026-10-09 用户定案）

三张总集页本来就在 `/vocab`（「总览全局」）与 `/listen`（「全部朗读」+「去重连播」）顶部横幅里直达，
单独做一个 `/master` 入口页是重复。已删 `master.md` 与 nav 项，`/master` 现在直接 404。

守卫两头：`verify` 查「源码里不得再有人指 master.html」（只豁免 check_portal 里那句故意探 404 的 `goto`），
`check_portal` 断言 `顶栏无「总集」栏` + `/master 页已取消（返回 404）`。

改动清单里还有一处容易漏：`sync-pages.mjs` 的 `kind==='master'` 返回入口由均指 `../../master.html`
改成词汇类 → `../../vocab.html`、听力类 → `../../listen.html`。

### A2. 顶栏「模型架构」栏（站外，2026-10-09 用户要求）

放在最后一栏（站内栏目都在它左边；后来插进来的「学习笔记」也就在它左边），
指 Sebastian Raschka 的 LLM 架构对比画廊。

地址是 `config.mts` 顶部的 `const LLM_GALLERY`——全仓唯一一份，自检从这一行正则取期望值，**改地址不用改自检**。
外链不需要拼 base：查过 VitePress 源码，`VPLink` 见到 `http(s)` 会自动给 `target="_blank" rel="noreferrer"`
并带 ↗ 图标，`normalizeLink()` 对外链原样返回（不拼 base、不动 query/锚点），实测 SSR 产物里就是。

自检断言：`顶栏「模型架构」是最后一栏（站内栏目都在它左边）`、
`「模型架构」是站外链接：新标签打开、地址原样（query 与 #锚点都没被 base 加工）`。

### A3. 新增「学习笔记」栏目（2026-10-09 用户要求）

`notes/<编号>_<论文短名>.md` 一篇一份，文件名 = `data/papers.json` 的 `dir`（两边契约，
`verify` 拿 `gen-notes.mjs --check` 对平篇目，不欠不多）。

用户提的「在‘总集’后面加」是过期叫法（「总集」栏已在 A1 删掉），四个位置/样式问题当次定案为：
顶栏放「词汇朗读」右边、「模型架构」左边；入口＝索引页 + 卡片第三枚按钮；
空白页＝空白处显示一行轻提示；索引页＝标出哪些还没写。

**受众分层（2026-10-09 用户纠正）**：上面那句“点进去就是你写的内容、正文是仓库里的
`notes/<编号>_<论文短名>.md`、在那条线以下写字、构建出来就渲染”——**错放在站点上**。
`/notes` 是给读者看的页面，读者不需要知道仓库目录、文件命名、构建流程。
同理，空白页轻提示原来写的「打开仓库里的 notes/ 目录，找到同名 md，在那条线以下写字」也是同一个毛病。
定案：这类“怎么写笔记”的操作说明只放两处——
① README「维护：改哪里」（仓库文档，读者看不到）；
② 每篇 `notes/*.md` 的 frontmatter 注释（在文件里给作者看，**不会渲染上页**）。
站点上只保留读者需要的一句话：`/notes` 页“每篇论文一篇学习笔记，点进去就是正文。”、
空白页轻提示“这篇还没有写笔记。”
（轻提示靠 `custom.css` 的 `.note-page .vp-doc > div:empty::after` 的 `content` 实现，文案也在那里。）
自检：`check_portal.cjs` 的「空白笔记页显示一行轻提示」只匹配 `/还没有写笔记/`，改文案不会失效；
另新增两条守卫：8b 黑名单扫的页面多了静态笔记页 `/notes/<编号>_<短名>.html`；
**8c 笔记栏目与空白笔记页禁作者向操作说明**（`npm run` / `notes/` / `papers.json` / `frontmatter` / `构建`）。
**8c 故意只扫这两页，不开全站黑名单**：“仓库”一词在论文总览页是正当正文（「视频/资料聚合仓库」在介绍外部 GitHub 仓库），
拿它当全页禁词会误伤（实测注入后 8c 能叫出 `命中 npm run,notes/`，而全站扫则 `/papers` 先假报）。
还有一条坑：`gen-notes.mjs` 的模板**只影响新建文件**，已生成的 32 篇要改注释得另跑一次脚本对齐存量
（本轮就是这么做的：逐篇先判「frontmatter 以下是否有正文」，有正文的一篇不动，只重写空白的 32 篇）。

三条设计决定都是为了让「用户往 md 里写字」这一步零成本：

① **写没写过**在构建期直接读原文（`import.meta.glob('../notes/*.md', { query: '?raw', eager: true })`，
   去掉 frontmatter 后 trim 为空就是未写），所以不新增任何 json、不新增任何生成步骤
   （往 papers.json 里加笔记字段会让每次写笔记都要重生数据）。
   判空口径在 `PaperIndex.vue` / `gen-notes.mjs` / `check_portal.cjs` 三处各写一遍，**改一处要三处一起改**。
② **空白页轻提示**用纯 CSS：VitePress 对「只有 frontmatter」的 md 渲染出
   `<div class="vp-doc …"><div></div></div>`，内层 div 真 `:empty`，
   所以 `.note-page .vp-doc > div:empty::after` 能命中，写了字自动失效。
   注意 `pageClass` 落在 `.Layout` 根上而不是 `.vp-doc` 上。
③ **页头**放在主题层（`NoteHeader.vue` 走 `#doc-before`）——读过 `VPDoc.vue` 确认它是 `<main>` 的兄弟、
   在 `.vp-doc` 外面，所以不破坏 ②；md 里不写一个字节，「未写」判定保持纯净。

`gen-notes.mjs` **只补缺、绝不覆盖**（没有 `--force` 分支），模板里那两行 `#` YAML 注释是写给用户看的指引，
不会渲染进页面。

页头编号 chip 试过直接用栏目青蓝 `#0284c7`，逐套量 WCAG 对比度最差 3.65:1（12px 小字不达标），
改成 `var(--dr-accent)` + `var(--dr-soft)`（跟卡片 `.dr-num` 同一口径）后十套最差 4.39:1；青蓝只留给按钮与返回链。

自检断言：`/notes 页 N 卡 × 一枚「学习笔记」按钮`、`笔记按钮指向 /notes/<编号>_<短名>.html（带 base）`、
`未写的篇目带「未写」小标（与空白文件数对平）`、`空白笔记页显示一行轻提示`、
`笔记页页头带编号＋论文名（空白页也不像白屏）`、`点页头「← 笔记索引」回 /notes`、
`页头只跟着笔记页（索引页无、SPA 切走后也会拆掉）`。

反向测试做过：往 `notes/01_DeepSeek-LLM.md` 追加一段 → `npm run notes` 报 `本次新建 0 篇`（覆盖不了），
build 后页面出现 `<h2 id="反向测试">`、「未写」32→31、轻提示断言如期失败；还原后 md5 与改动前一致。

### A4. 首页开头收进一张卡（2026-10-08 用户嫌光秃段落突兀）

`index.md` 不再直接写正文，改成 `<HomeIntro />`（`components/HomeIntro.vue`），样式在 `custom.css` 的 `.dr-intro` 段。
两种学法做成绿/橙两枚可点入口（沿用全站按钮分色），篇数仍从 `data/master.json` 取。
自检断言：`/ 首页学法卡两枚入口`。

> 同一轮出过一版高保真整套改版方案（大卡片面板那类），用户 2026-10-09 明确**整体作废**，
> 不要再往那个方向走；保留下来的只有上面这张介绍卡和按钮分色约定。

### A5. 门户页面不写内部黑话（2026-10-08 用户第二次嫌丑）

首页正文与页脚里的「按十一档词表（四级…GRE＋超纲）全量重做」全部拿掉，页脚只留 `copyright` 一行
（带篇数，仍从 `data/master.json` 取）；`TTS`、`双视图`、`先听后现`（未解释就使用）、
「即工作区 xxx.pdf」「HF 30 漏收、本次补录」「按 sitemap 全量核验」这类要么删要么换成大白话。

自检断言：`/ /vocab /listen /papers /notes 无内部黑话`
（页清单在 `check_portal.cjs` 的 `PAGES`，禁词表在同一文件的 `BANNED`）。

⚠ 例外：`/study/` 下 32 张静态词页顶部副标题仍写着「全量口径重做 · N 节 X 词 · 十一档 + 超纲（日期）」，
2026-10-08 用户定案**暂不动**；要改就改 `../词页重做_20261008/build_pages.py` 的 `sub` 一行再批量重出。

### A6. 站名改为「鲸读」（2026-10-16 用户定案）

旧名「DeepSeek 论文词汇学习站」用户嫌不好听，定为 **「鲸读 · DeepSeek 论文词汇」**：
短品牌名「鲸读」（鲸扣 DeepSeek 蓝鲸 logo，读扣朗读＋阅读）＋说明后缀，顶栏和标签页都放得下。

落地一处不漏（旧名全仓 grep 清零）：`config.mts` 的 `title`/`description`/页脚 `copyright`、
`index.md` 的 frontmatter `title` 与 H1、`check_portal.cjs` 的 `首页标题正确` 断言、`README.md` 标题行。

同日标签页图标（`public/favicon.svg`）由「词」字方块换成 DeepSeek 蓝鲸 logo（品牌色 `#4D6BFE`，
源文件去掉 `1em` 尺寸与内联 style 后落仓），用户点名只换 favicon，顶栏不加 logo 图。

---

## B. 页面与样式定案

### B1. 论文总览链接不带下划线（2026-10-08 用户要求）

下划线来自 VitePress 默认的 `.vp-doc a{text-decoration:underline}`，靠 `papers.md` 的
`pageClass: wide papers` + `.papers .vp-doc a{text-decoration:none}` 压掉，`:hover` 才显下划线以保留可点反馈。
⚠ 类名由 `refresh-papers.mjs` 的 `HEAD` 生成，**别只改 `papers.md`**（会被下次刷新覆盖）。
自检断言：`/papers 页链接无下划线`。

### B2. 论文总览只写读者需要的内容（2026-10-08 用户定案）

内部勘误/剔除过程（「剔除记录」「归属更正」「此前记录有误」这类）一律不写进面向读者的页面。
不属于本站的论文就**直接删行**，不留划掉的一行；这类留痕只写台账（本文件、工作区 `PIPELINE.md`）。
改的时候动仓内文稿 `content/DeepSeek_论文列表.md`，再跑 `npm run papers`。

### B3. ThemeSwitcher：圆钮不显示主题名（2026-10-09 用户第二次要求改版）

顶栏只剩一颗**圆形小钮，不显示主题名文字**（钮内小圆点左半＝当前主色、右半＝当前背景色），
点一下下一套，shift+点击回上一套，数字键 1–0 直达；主题名只出现在 `title`（悬停）与 `aria-label` 里。
共 10 套，默认「墨绿」；不铺一排主题名（2026-10-08 的要求仍成立）。

自检断言：`默认主题＝墨绿`、`换背景钮上不出现任何文字`、`点一下切到下一套`、`shift+点击回上一套`、
`数字键直达暗色`、`刷新后记住主题`（均从 `theme-defs.mjs` 现推，加配色不用改自检）。

### B4. 新加配色必须过对比度门（2026-10-09）

`gen-theme-css.mjs` 逐套算 5 组 WCAG 比值（正文/背景、正文/卡片、次要文字/背景、主色/背景、按钮字/主色），
任一 < 4.5:1 就**全部报完再退出码 1 且不写盘**。主题多于 10 套也会报错（数字键不够用）。

首次启用就抖出一个陈病：「暖纸」主色 `#5f7a3f` 对背景只有 4.31:1，已调深为 `#567038`（4.97:1）。

### B5. 总集入口横幅两键平分（2026-10-08 用户要求）

`/listen` 的「全部朗读」+「去重连播」旧写法是 `.dr-m-main{flex:1}` + `.dr-m-alt` 内容宽，实测 1148 : 154；
现两键均 `flex:1 1 0`（+ `min-width:0`）、副键文字居中。`/vocab` 只有一个主键，依旧整行。
自检断言：`/listen 总集入口两键平分`。

### B6. 首页改成报纸头版 + 艺术卡轮播，搜索搬到顶栏（2026-10-23 用户定案）

首屏先在 `design/20261020_MotionFace风格/` 里迭代定稿，再搬进正式站：
左栏是「报眼 + 三行衬线大标题 + 粗细两条线 + 报尾」的报纸头版，右栏是十种艺术流派卡
（野兽派 / 达达 / 风格派 / 包豪斯 / 构成主义 / 装饰艺术 / 波普 / 欧普 / 孟菲斯 / 水墨）
按艺术史年代自动轮播，2.6s 一张。卡片之间用 `clip-path` 从顶部擦入，**不是淡入**——
淡入会让两张卡中央的文字半透明叠成重影（实测）。

⚠ 配色分两类，别混：报头的线、字走主题变量（`--dr-ink` / `--dr-line`），深色主题下自动反转成
「夜报」；十张卡片的配色是卡片自身的一部分，写死不跟主题走，否则换主题时色块会失真。

索引区原来的搜索框已删，搜索统一到顶栏「找论文」：`components/PaperSearch.vue` 挂在
`Layout.vue` 的 `#nav-bar-content-after`，点开是居中弹窗，输入即筛，`↑↓` 选、`↵` 打开、`esc` 关；
只做「在 32 篇之间跳转」，全文检索仍交给 VitePress 自带搜索。索引头部只剩
「32 篇技术报告 · 看词 / 听读 / 笔记」+ 排序（说明行按 `mode` 换文案，词汇页不会写成「听读」）。
`index.md` 里的 Markdown `# 标题` 同时删掉，页面 h1 由报头承担，避免同屏两个 h1。

自检断言：`/ 首页报头两枚入口（带 base 的 .html）`、`「找论文」输入 "R1" 收敛到少数`、
`esc 关闭弹窗且解锁页面滚动`。

同批修掉一个既存泄漏：`design/` 下的 6 个 `.md`（改版说明、诊断、否决记录）原来会被 VitePress
当页面编译，导航里虽没有入口、但 URL 能直接打开，正文还带着源码文件名。已把 `design/**`
加进 `config.mts` 的 `srcExclude`，与 `README.md` / `DECISIONS.md` / `deep-reading/**` 同类处理。
git 侧用户同日定案（2026-10-23）：`design/` 既不进 git 也不渲染，已加进 `.gitignore`
（目录从未被跟踪过，加一行即生效，无需 `git rm --cached`）。

> 宽版页面放不开容器宽度是机制问题不是审美定案，已归 §C10。

---

## C. 机制性坑（症状 → 成因 → 修法）

旧版 README 用「坑1…坑8」编号，源码注释与工作区 `PIPELINE.md` 里还留着这些号。对照：

| 旧号 | 现条目 | | 旧号 | 现条目 |
|---|---|---|---|---|
| 坑1 | C1 SPA 拦截 | | 坑5 | （已废，无对应） |
| 坑2 | C2 样式权重 | | 坑6 | C5 public 只放 html |
| 坑3 | C10 宽版三处瓶颈 | | 坑7 | C4 font 简写 inherit |
| 坑4 | C3 preview 缓存 | | 坑8 | C6 Pages 子路径三件套 |

> custom.css 里另有两处「坑8」指的是旧首页卡版本的「同排等高用 grid 而不是 min-height」，
> 那整套改版方案已作废（见 A4 末），此条不入表；看到就当「用 grid」读。

### C1. SPA 拦截：静态页链接必须 `target="_self"`（坑1）

`public/study/**.html` 不是 VitePress 路由，被 SPA 接管会白屏。所有指向它们的链接带 `target="_self"`，
退化成真实整页跳转。自检有专门的静态页跳转断言。

### C2. 样式权重：`.dr-lib .xxx` 两段式（坑2）

索引组件样式一律两段式，压过 `.vp-doc` 正文权重（含最阴的 `.vp-doc a`）。

### C3. preview 进程会缓存在内存里（坑4，最容易误判）

`npm run preview` 只在 build 之后启动，且**每次重新 build 都要重启进程**。
旧进程把 dist 的资产清单缓在内存里，新 hash 的 `style.*.css` / `app.*.js` 会 404，
页面退回浏览器默认样式——症状是自检报「控制台 0 报错」失败 + 链接又出现下划线，极容易被误判成「CSS 没生效」。

### C4. `font` 简写里不能出现 `inherit`（坑7）

`font: 400 14px/1 inherit` 是**无效写法**（`inherit` 只能占整条属性，不能当 font-family 用在简写里），
浏览器会把**整行声明丢弃**，同一行里的 `border-radius` / `padding` 也跟着没——
症状是「写了样式但不生效」，且不报错、不红。要写就拆 `font-size` / `font-weight` / `line-height` longhand。
（2026-10-08 首页卡时发现，已把旧的两处一并改掉。）

### C5. `public/` 只放 `.html`（坑6）

同步脚本过滤掉 `.md`，否则 VitePress 会尝试编译它们。

### C6. GitHub Pages 子路径三件套（坑8）

项目站固定在 `https://<user>.github.io/<repo>/`，三件事绑在一起：

① `base` 必须等于仓库名；
② `cleanUrls` 必须关——Pages 不做 URL 重写，访 `/vocab` 只会 404（盘上只有 `vocab.html`）；
③ **VitePress 不会给原生 HTML 的 href 加 base**（md 里直写的 `<a href="/study/...">` 与 Vue 模板里的字面量 href 都不加），
   所以组件里要 `withBase()`、md/静态页要写相对路径。

症状很阴：本地根路径部署时全部正常，上 Pages 后点哪儿都是用户站 404。
自检断言：`门户五页无根绝对链接漏网`（扫 `a[href^="/"]`，凡不以 base 开头的都算漏网）。

### C7. 返回入口为什么全用相对路径

站点挂在 `/<repo>/` 子路径下，根绝对路径会跳出子路径打到用户站 404。

- 词汇页：同步时注入左下角固定「← 返回索引」浮标（模板本身无返回入口），指 `../../vocab.html`。
- 听力页：模板里 `location.href="../../listen/"` 被改写为 `"../../listen.html"`（有上一条历史时该按钮走 `history.back()`）。
- 总集三页（A1 取消站根页后）：词汇类浮标指 `../../vocab.html`，听力类箭头指 `../../listen.html`。
- 笔记页（A3 新增栏目）：页头右侧「← 笔记索引」走 `withBase('/notes.html')`（站内页，不是静态页浮标）。

自检守住这几条：`门户五页无根绝对链接漏网`、`词汇页返回浮标为相对路径`（含真点击）、
`听力页相对返回路径解析到子路径内`、`点页头「← 笔记索引」回 /notes`。

`sync-pages.mjs` 的链接校验会把跳出 `public/` 的相对链接回退到仓库根 `x.md` 判定
（站根页只在编译后存在，盘上没有 `public/vocab.html`）。

### C8. 自检本身的两个坑（写断言时必看）

- **SPA 切页不发网络请求**，`waitForLoadState('networkidle')` 会立刻返回，此时 Vue 还没重渲染。
  断言「某元素已被拆掉」要用 `waitForSelector(sel, { state: 'detached' })`，
  否则会写出「SSR 产物明明正确、断言却失败」的假阴性（A3 的页头断言踩过）。
- **故意探 404 要用独立 page**，否则 404 会进 console，把「控制台 0 报错」这项自己打翻（实测踩过 46/47）。

### C9. 可被 import 的生成脚本要加 main guard

`gen-notes.mjs` 导出 `stripFront` 给 verify/自检复用，因此脚本尾部必须有
`if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) process.exit(main())`——
否则「被 import 就顺手写盘」，只跑一个检查就会生成/覆盖文件。

### C10. 宽版三处瓶颈（旧坑3，2026-10-08 实测）

光改 `.content` 的 max-width 不够，还有 `.container` 被限 1104px、`has-aside` 白占 256px 侧栏位，
需 `.wide .VPDoc .container{max-width:100%!important}` + `.wide .VPDoc .aside{display:none}` 一起放开；
放开后 1440 视口下栅格一排 4 卡。索引页与论文总览靠 frontmatter 的 `pageClass: wide` 命中这套样式。

---

## D. 部署、门禁与内容自足

### D1. 内容层自足（2026-10-09 定案）

这是一个独立代码仓库，产出的站点是要部署出去的静态网页，所以**内容层的输入全部在仓内**，
不再靠工作区的兄弟目录「渲染过来」：

| 内容 | 旧做法（依赖仓外）| 现在的真源（仓内）|
|---|---|---|
| 论文总览页 | `../门户文稿_20261008/DeepSeek_论文列表.md` | `content/DeepSeek_论文列表.md`（文稿即源码）|
| `data/papers.json` | `../workdir/NN_*/words.json`（已随清理删除，旧脚本一跑就写出 0 篇）| `public/study/vocab/*.html` 页面自带的 `DATA` + 页头 `ptitle` |
| `data/master.json` | `../汇总站_20261008/merge_all.py` 写入 | 同上一条，由 `gen-data.py` 一起重推 |

重推结果与当初生成的两个 json **字节完全一致**（32 篇 / 16299 词次 / 3241 去重词），所以搬进来不改变任何页面。

仍留在仓外的只有**页面本体**（67 张词页/听力页/总集页的生成器在技能侧），
它们通过 `npm run sync` + `.sync-manifest.json` 指纹进来并有守卫对账，属于「受控导入通道」，不是隐式依赖——
这就是为什么本地那一半门禁不可省（D2）。

### D2. 为什么本地那一半门禁不可省

内容层（文稿、两个 json）已搬进仓内，但 **67 张词页/听力页/总集页本体仍在仓库外**
（`../vocab_pages/`、`../listen_pages/`、`../汇总站_20261008/pages/`），CI 拿不到。
改了源页却忘了同步就 push，Action 只会照着仓里的旧副本构建——所以靠
`.sync-manifest.json`（源页 sha1 指纹）在本地判定「副本是不是旧的」，并由 pre-push 钩子拦下。

**61 项浏览器自检不放 CI**：它要装 playwright + chromium，且 ubuntu 的字体/控件尺寸与本地有差异，
一旦误报就会直接卡住发布。所以它做本地提交前的手动门禁，CI 只跑零依赖的 `npm run verify`（14 项）。

### D3. 五道门禁分别守什么

| 门禁 | 命令 | 零依赖 | 跑在哪 | 守住什么 |
|---|---|---|---|---|
| 内容守卫 | `npm run verify` | ✅ | CI + pre-push | 14 项对账：数据与页面一致、无仓外路径、无残留引用、指纹对平 |
| 断链实验 | `npm run selfcheck` | ✅ | 手动 | 仓库在孤立目录下也能重建内容 |
| 浏览器自检 | `node scripts/check_portal.cjs` | ❌ playwright | **只有本地** | 61 项走完整用户路径（含真点击、真渲染、真 URL） |
| pre-push | `npm run hooks` 装 | ✅ | 本地 push 前 | sync → verify → 工作区必须干净 |
| CI | 自动 | ✅ | push 后 | verify → npm ci → build → 发 Pages |

期望值全从 `data/*.json`、`theme-defs.mjs`、`config.mts` 或文件系统现推，**加篇/改名/加配色都不用改脚本**。
仓库自己就能重建的三条保障：

1. 三个生成器都有 `--check`（只比对不写盘）：改了文稿/词页/篇目却忘了重新生成 → 门禁直接失败。
2. `npm run verify` 里那三项跑这三个 `--check`，并扫描三个内容脚本**拼路径的那些行**，
   出现「上跳两级 / 工作区兄弟目录名 / `/Users/`」就报错。
3. `npm run selfcheck`（断链实验）：把仓库拷进临时目录（旁边没有任何工作区目录）再跑一遍——
   在原地跑不算证明，仓外路径在原地照样解析得到。

`verify_content.mjs` 那 14 项的具体清单：papers.json 每篇两条路径都真在 public 下、study 无孤儿页、
页数与篇数对平、静态页无根绝对 href/src、无 `/Users/` 痕迹、组件引用的三张总集页都存在、
**无残留的 /master 页引用**、**副本与源页指纹对平（含「源目录多了新页但仓里没同步」）**、
**pre-push 钩子已装且与源码一致**、**papers.json/master.json 与仓内词汇页重推一致**（`gen-data.py --check`）、
**papers.md 与仓内文稿一致**（`refresh-papers.mjs --check`）、**notes/ 与 papers.json 篇目一一对应**
（`gen-notes.mjs --check`）、**三个内容脚本的默认输入全在仓内**。
其中两项在 CI 记为「跳过」（退出码仍为 0），但**跳过理由不是一个**：「副本指纹」那一项要的是仓外源页目录，
CI 确实没有；「钩子一致」那一项**不能拿「有没有 `.git`」当判据**——`actions/checkout` 会建 `.git`，
CI 里它存得下、只是没人跑 `npm run hooks`，于是旧写法在 CI 直接判失败（首跑就栽在这儿）。
现在它按环境变量跳（`GITHUB_ACTIONS=true` 或 `CI=true`），跳过时把是哪个变量打进理由里；
本地（无这两个变量）照旧硬判——拿一个没装钩子的干净 clone 跑一遍仍是 `✗ exit 1`，确认没把门禁改成哑炮。
其余 12 项在 CI 照跑。

### D4. GitHub Pages 部署（2026-10-09 已上线；首跑挂在 verify、修完的第二次跑绿）

站点 `https://luojun0115.github.io/deepseek-words/`，remote `origin → https://github.com/luojun0115/deepseek-words.git`。
**已配成自动部署**：`on: push → main`（外加 `workflow_dispatch` 可手动重跑），
以后只要有改动 push 到 main，Action 就自动 对账 → 构建 → 发布，不用任何人再到网页上操作。

**两次跑的实况（REST 匿名读到，无需 gh CLI；公开仓可读 `/actions/runs` 与 `/actions/runs/<id>/jobs`）**：
run #1（`7d66c77`）`completed / failure`，挂在第四步 `Verify content consistency`（后面装依赖/构建/发布全 skipped），
所以当时线上全是 404。挂的就是上面那第 7 项在 CI 里误判——**不是 Node 20 那条告警**，告警只是告警，
Checkout 与 Setup Node 两步皆 success。run #2（`e6c6ef7`，修完那个判据 + action 全升 Node 24）`completed / success`，
线上随即 200：`/`、`/papers.html`、`/vocab.html`、`/listen.html`、`/notes.html`、一篇笔记页、
一篇 `study/vocab/` 与 `study/listen/`、一张 `study/master/` 全 200，`/README.md` 与 `/DECISIONS.md` 仍 404（`srcExclude` 在站上也生效）。
另拿部署产物与本地 `dist` 对指纹：同一份 `assets/style.DwVic_ZB.css`，且里面确实是新版轻提示——线上就是最新那版。
（踩过一次：轻提示是纯 CSS `::after` 的 `content`，**只在样式表里，不在页面 HTML 里**，
拿页面正文去 grep 会得到一个假失败。）

**Settings → Pages → Source = GitHub Actions 这条已经确认生效**：run #2 的 deploy job 发布成功、站点 200，
Source 若还停在「Deploy from a branch」就不会有这个结果（匿名读 `/pages` 端点始终返 404，分不清是没启用还是要登录，
所以当时没能正面确认，事后由上线结果反推）。

已就位的件：

| 件 | 内容 |
|---|---|
| `.github/workflows/deploy.yml` | Checkout → Setup Node 22 → **`npm run verify`（排在装依赖之前，不对就立即失败）**→ `npm ci` → `npm run build` → upload `.vitepress/dist` → `deploy-pages`。action 版本见下条 |
| action 版本（2026-10-09 迁 Node 24） | GitHub runner 上的 Node 20 已于 2026-09-23 移除（2026-06-16 起 Node 24 就是 JS action 默认运行时，源：github.blog/changelog/2025-09-19 及其 2026-08-25 编者注），旧 `@v4` 那批不会报错，只是被 runner 强行搬到 node24 上跑并刷一条告警。**降级会重新引出告警，别改回去**。拉各自 tag 的 `action.yml` 实测：仓里原来的**五个**引用全都声明着 `using: node20`（不只是告警里点名的 checkout / setup-node 两个，也不是只升两个就能干净），所以一次全升到 `checkout@v7` `setup-node@v7` `configure-pages@v6` `upload-pages-artifact@v5` `deploy-pages@v5`；其中 upload-pages-artifact 是 composite，自身不声明 runtime，靠它 v5 内部 pin 的 `upload-artifact@v7.0.0` 才拿到 node24。这五个主版本 tag 已用 `git ls-remote` 逐个核过存在。`node-version: 22` 是站点构建用的 Node，与 runner 自身用什么无关，两件事不要混；它**故意不跟到 24**：本机就是 v22.12.0，CI 跟本地一致才能叫可重现，要升也得先在本机升 Node 跑一遍全站自检。 |
| `.githooks/pre-push` | push 前三步：`sync` → `verify` → `git status --porcelain` 必须为空（同步产生变化 = 你想推旧内容，先提交）。源码进仓，但 `.git/hooks/` 不跟仓走，所以每个克隆要 `npm run hooks` 装一次 |
| `.sync-manifest.json` | sync 产出的 67 条「仓内副本 → 工作区源页 + 源页 sha1」，**跟仓一起提交** |
| `public/.nojekyll` | 随 dist 进仓，关 Jekyll 处理（否则下划线开头资产会被剔，见 §C6）|
| `config.mts` | `base = DOCS_BASE ?? '/deepseek-words/'`、`cleanUrls: false`、favicon 手动拼 base、nav 六栏（最后一栏「模型架构」是站外链）、`srcExclude` 挡掉两份仓内文档 |
| 链接 | 组件走 `withBase()`；静态页与 md 里的原生 HTML 全用**相对路径**（为什么，见 §C6、§C7）|

临时换 base：`DOCS_BASE=/ npm run build`；自检配套用 `PORTAL_BASE=http://localhost:4188`。

### D5. 仓库目录与脚本全清单

README 只留一张简表，完整目录树、脚本清单与命令全集在这里。

```
.vitepress/config.mts        # 站点配置：base / nav 六栏 / cleanUrls:false / srcExclude
.vitepress/theme/            # theme-defs.mjs（★主题真源）· NoteHeader.vue · ThemeSwitcher.vue
                             #   custom.css（索引样式）· Layout.vue · theme.generated.css（生成勿改）
components/                  # PaperIndex.vue（索引 + 每篇入口）· HomeIntro.vue（首页介绍卡）
content/DeepSeek_论文列表.md  # ★ 论文总览的文稿母本（文稿即源码）
notes/<编号>_<短名>.md        # ★ 学习笔记，一篇一份，用户手写、脚本只补缺
data/papers.json master.json  # 清单与统计，由 gen-data.py 从仓内词汇页现推（勿手改）
public/study/{vocab,listen,master}/  # 67 张同步进来的成品页
public/.nojekyll              # 关 Jekyll 处理（否则下划线开头资产会被剔）
.sync-manifest.json          # 源页 sha1 指纹（sync 产出，跟仓一起提交）
.githooks/pre-push  .github/workflows/deploy.yml   # 上线两半门禁（§D4）
index.md vocab.md listen.md papers.md notes.md     # 五张站内页（papers.md 由 content/ 渲染）
README.md  DECISIONS.md                             # 两份仓内文档，都在 srcExclude 里
scripts/
  sync-pages.mjs             # 复制 + 修返回链接 + 写指纹 + 校验（失效退出码 1）
  gen-data.py                # 仓内词汇页 → papers.json + master.json（缺页/越档/解析失败先报错、继不写盘）
  gen-notes.mjs              # papers.json → notes/ 补缺空白笔记（只补缺，带 main guard，§C9）
  refresh-papers.mjs         # content/ 文稿 → papers.md（--check 只比对不写）
  add-numbers.py             # papers.json → 回写仓内文稿的「编号」列与图例
  gen-theme-css.mjs          # theme-defs.mjs → theme.generated.css（兼校 12 变量齐全 + 每套对比度 ≥ 4.5:1）
  verify_content.mjs         # 14 项内容守卫（零依赖，CI 也跑）
  selfcheck_in_repo.mjs      # 断链实验：孤立副本里重建内容（npm run selfcheck）
  check_portal.cjs           # Playwright 全路径自检（61 项，不进 CI，§D2）
  shot_nav.cjs shot_themes.cjs  # 顶栏/首页与逐套配色截图（人工核版面，不断言）
```

常见维护任务的完整对照（改哪个文件 → 接着跑什么）：

| 要动什么 | 文件 | 接着跑 |
|---|---|---|
| 论文总览页正文/表格/图例 | `content/DeepSeek_论文列表.md`（不是 `papers.md`！）| `npm run papers` → build |
| 学习笔记正文 | `notes/<编号>_<短名>.md` | `npm run build`（无需重生数据，§A3）|
| 笔记页页头 | `theme/NoteHeader.vue` + `custom.css` 的 `.dr-note-*` | build |
| 首页报头 + 艺术卡轮播（§B6）| `components/HomeIntro.vue` + `theme/custom.css` 的 `.dr-hero*` | build |
| 顶栏「找论文」搜索弹窗（§B6）| `components/PaperSearch.vue` + `theme/custom.css` 的 `.search-modal` / `.sm-*` | build |
| 索引卡 / 排序 / 入口按钮 | `components/PaperIndex.vue` + `theme/custom.css` | build |
| 顶栏栏目 · 站外「模型架构」地址 | `config.mts` 的 `nav`（外链在顶部 `const LLM_GALLERY`）| build |
| 配色 | `theme/theme-defs.mjs`（10 套，数组顺序＝数字键）| `gen-theme-css.mjs`（对比度门）→ build |
| 卡片上的篇目 / 词数 / 档位 | 真源是 `public/study/vocab/*.html` 自带的 `DATA` | `npm run data` → build |
| 词页 / 听力页本体 | 在技能侧生成（工作区 `vocab_pages/`、`listen_pages/` 仍在），改好把成品页交进来 | `npm run sync` → build |
| 总集页本体（三张）| 生成器所在的 `../汇总站_20261008/` **已不在工作区**，只能手改仓内副本 | build（见本节末尾说明）|

命令全集与顺序约束：

```bash
npm run data            # 仓内词汇页 → data/papers.json + data/master.json
npm run papers          # content/ 文稿 → papers.md
npm run notes           # papers.json → notes/ 补缺空白笔记（--check 只对平不写盘）
npm run sync            # 工作区成品页 → public/study，修返回链接 + 写指纹 + 校验
npm run build           # 构建到 .vitepress/dist
npm run preview         # 本地预览（默认 4173；本仓惯例固定成 4188）
npm run verify          # 14 项内容守卫（零依赖，CI 跑的就是这份）
npm run selfcheck       # 断链实验：拷孤立副本重建内容
npm run hooks           # 装 pre-push 门禁
```

词表或页面有更新时顺序不能倒：`npm run data` → `python3 scripts/add-numbers.py --force`（编号列写回文稿）
→ `npm run papers` → `npm run sync`；加篇后还要 `npm run notes` 补空白笔记。
改完配色逐套目检：`NODE_PATH=$(npm root -g) node scripts/shot_themes.cjs`（→ `previews/themes/*.png`，需先 build + 起 preview）。
`master.json` 现在也由 `gen-data.py` 重推，**不再跑 `merge_all.py`**。
总集三页本身已无生成器可重建（工作区目录已删），仓内 `public/study/master/` 那三张是**目前唯一副本**：
它们已进仓、跟仓一起发布，但**改不了也不能重生**——要改总集页得先找回生成器，别拿仓内副本当可重建产物。
（2026-10-09 核对：`../门户文稿_20261008/`、`../汇总站_20261008/` 已从工作区消失；
前者已由仓内 `content/DeepSeek_论文列表.md` 接下、不受影响，后者就是本条说的缺口。
`npm run sync` 与指纹对账对不存在的源目录是优雅跳过，不是报错，所以站不会因此坏。）
