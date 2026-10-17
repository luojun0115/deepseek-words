# 鲸读 · DeepSeek 论文词汇（学习门户）

## 这是什么

把 **32 篇 DeepSeek 官方技术报告**（2024-01 的 `DeepSeek-LLM` 到 2026-09 的 `DeepSeek-V4.1-Flash`，
arXiv 号 `2401.02954` → `2609.19969`）里需要单独学的单词挑出来、按英语考试级别分级，做成能在浏览器
直接学的页面，再接成一个站点：论文词汇学习、词汇朗读（听力）、以及每篇一份的学习笔记。

规模：**16,299 词次**，去重后 **3,241 个词**。每篇 255～1044 词（中位 463）。
分级沿考试链从低到高，**取最低能覆盖它的档**，十个档都够不着的进「超纲」：

| 四级 | 六级 | 考研 | 专四 | 考博 | 专八 | 雅思 | 托福 | GRE | 超纲 |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 6572 | 5250 | 124 | 1051 | 789 | 679 | 160 | 1042 | 361 | 271 |

数据不依赖任何工作区、外挂目录——**仓库自身就是内容源**，`content/` 文稿、`data/*.json`、
`theme-defs.mjs` 都跟仓一起提交，克隆下来 `npm run papers` / `npm run notes` /
`node scripts/gen-theme-css.mjs` 三条就能重建全部派生文件（详见 `DECISIONS.md` §D1）。

顶栏五个栏目在本仓，外加一个站外链接：

| 栏目 | 地址 | 是什么 |
|---|---|---|
| 首页 | `/` | 项目介绍 + 论文检索索引（默认落地页）|
| 论文总览 | `/papers` | DeepSeek 系列发展脉络（文稿即源码）|
| 词汇学习 | `/vocab` | 32 篇词页索引，逐篇按章节/级别学词、听发音 |
| 词汇朗读 | `/listen` | 32 篇听力页索引，逐词连播 |
| 学习笔记 | `/notes` | 32 篇笔记，每篇一份本地 md，写什么上什么 |
| 模型架构 | 站外 `sebastianraschka.com/llm-architecture-gallery` | Sebastian Raschka 的 LLM 架构对比画廊（地址在 `config.mts` 的 `LLM_GALLERY`）|

另外有三张**总集页**不占导航位，挂在栏目页顶部横幅上（见「怎么用」）。

## 怎么用

线上地址：**`https://luojun0115.github.io/deepseek-words/`**（仓库 `github.com/luojun0115/deepseek-words`，2026-10-09 已上线）。
本地预览：`npm run build && npm run preview` → `http://localhost:4173/deepseek-words/`。

**词汇学习页**（`/vocab` 选一篇进去）
- 「按章节 / 按级别综合」两种看法：跟论文走，或按考试档集中扫
- 「▶ 学习模式」像 PPT 一页一页过，空格下一页、`Esc` 退出
- 点任意单词听发音；左右「上一页 / 下一页」翻页
- 页内样式三档：白天 / 夜晚 / 暖白

**词汇朗读页**（`/listen`）
- 逐词连播，语速 / 每词停顿 / 单词重复次数可调
- 先听后现、朗读例句、朗读中文、跳过已掌握（星标收藏）
- 定时停止；十八种皮肤；导出 / 导入备份

**三张总集页**（在 `/vocab`、`/listen` 顶部横幅，不在首页）

- 「总览全局」→ 词汇总集：32 篇去重后 3,241 词，一页通览
- 「全部朗读」→ 听力总集：从第 01 篇一路连播到第 32 篇，共 16,299 词次
- 旁边另给一个「去重连播 · 3,241 词」入口

**学习笔记**（`/notes`）：每篇一份空白页，写的是 `notes/*.md`，站点的目录和页头不用你管。

**检索与配色**：首页可搜论文名 / 编号 / arXiv 号，可按编号或词数排序；顶栏 10 套配色全站切换
（默认墨绿，数字键 1～0）。

## 怎么跑

前提：Node 22。

```bash
npm ci        # 依赖只有 vitepress 一个
npm run hooks # 装本地 pre-push 门禁（每个新克隆都要跑一次）
npm run dev   # 开发服务器，改 md / vue 立见
```

手上已有成品页、第一次把仓接满（平时用不着，只有词表换了才跑）：

```bash
npm run sync    # 成品页 → public/study，修返回链接 + 记指纹 + 校验
npm run data    # 从仓内词页现推 data/papers.json + master.json（32 篇的词数、档位都从这儿来）
npm run notes   # 按清单给缺的篇补空白笔记（只补缺，绝不改你写过的）
```

改文稿 / 改配色 / 改样式之后怎么跑，见下面「维护」表；完整命令清单与目录树在 `DECISIONS.md` §D5。
自检三条，绿色才算改完：

```bash
npm run verify     # 14 项内容一致性守卫（零依赖，CI 跑的就是这份）
npm run selfcheck  # 断链实验：把仓库拷进隔离副本、只读自身重建一遍
```

## 怎么部署（GitHub Pages）

已跑通（2026-10-09 站点已上线），push 到 `main` 即自动构建发布（`.github/workflows/deploy.yml`）：
`verify` → `npm ci` → `vitepress build` → `deploy-pages`。之后每次 push 都跑完整链路，没有「只 push 不构建」。

只在首次接仓时需要手动两处（都在 GitHub 网页上，已经做过；**换了仓库名 / 新建仓时要再点一次**）：

1. 首次推送：`git push -u origin main`
2. Settings → Pages → Source 选 **GitHub Actions**。默认是「Deploy from a branch」，
   不改成 Actions 的话，构建成功也看不到站点——它只会去发布 `main` 分支根目录。

要托管到别的静态服务同理：`npm run build` 后把 `.vitepress/dist/` 整个交出去。

`base` 默认 `/deepseek-words/`（跟仓库名 `deepseek-words` 一致）。换仓库名或子路径要同步改 `config.mts`，
或临时 `DOCS_BASE=/xxx/ npm run build`；`cleanUrls: false` 不许改，理由见 `DECISIONS.md` §C5。

## 维护：改哪里

| 要动什么 | 改哪儿 |
|---|---|
| 论文总览页的正文、表格、图例 | `content/DeepSeek_论文列表.md`，然后 `npm run papers`（**别改 `papers.md`**，它由文稿生成，会被覆盖）|
| 学习笔记正文 | `notes/<编号>_<论文短名>.md`（文件名对应 `data/papers.json` 的 `dir`）：两条 `---` 之间的注释以下随便写，标题、表格、代码块、图片都支持，写完 `npm run build` 就渲染到 `/notes` 点进去的那页；空着时页面只显一行轻提示（那句提示里不会出现仓库路径，读者不需要看这些）|
| 首页开头那张介绍 | `index.md` + `components/HomeIntro.vue` |
| 索引卡、搜索、排序、每篇入口按钮 | `components/PaperIndex.vue` + `.vitepress/theme/custom.css`，然后 build |
| 顶栏栏目、站外「模型架构」地址 | `.vitepress/config.mts` 的 `nav`，然后 build |
| 配色 | `.vitepress/theme/theme-defs.mjs`，然后 `node scripts/gen-theme-css.mjs`（它带对比度门）→ build |
| 词页 / 听力页本体 | 在技能侧生成（工作区 `vocab_pages/`、`listen_pages/` 还在），改好把成品页交进来跑 `npm run sync` |
| 总集页本体 | 生成器已不在工作区，仓内那三张是**唯一副本**，只能手改副本（见 `DECISIONS.md` §D5）|

★ 三条反复咬人的规矩：主题变量只改 `theme-defs.mjs`（改生成物等于没改）；
`.githooks/pre-push` 只调 `verify`，CI 跑 `build`；新增带样式的 md 页必须同时进
`config.mts` 的 `pages`、`verify_content.mjs` 的 `MD_PAGES` 与 `check_portal.cjs` 的清单。
完整坑录见 `DECISIONS.md` §C，门禁与部署细节见 §D，目录与命令全集见 §D5。
