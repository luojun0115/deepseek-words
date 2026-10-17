import { defineConfig } from 'vitepress'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { THEMES, DEFAULT_THEME } from './theme/theme-defs.mjs'

// 描述/页脚的篇数与词数跟着总集数据走（仓内 scripts/gen-data.py 从词汇页重推），不写死
const ST = JSON.parse(readFileSync(
  fileURLToPath(new URL('../data/master.json', import.meta.url)), 'utf8'))

// GitHub Pages 项目站点固定部署在 https://<user>.github.io/<repo>/ 子路径下，
// 资产与路由都按这个 base 生成；换仓库名/换自定义域名时用 DOCS_BASE 覆盖（如 '/'）
const BASE = process.env.DOCS_BASE ?? '/deepseek-words/'

// 顶栏「模型架构」栏的站外地址（Sebastian Raschka 的 LLM 架构对比画廊）。
// 外链不需要拼 base；VitePress 的 VPLink 见到 http(s) 会自动 target="_blank" rel="noreferrer" 并带↗图标。
// 自检（scripts/check_portal.cjs）从这一行正则取出期望值，改地址只改这里
const LLM_GALLERY = 'https://sebastianraschka.com/llm-architecture-gallery/?compare=antares-1b%2C#card-olmo-2-7b'

export default defineConfig({
  base: BASE,
  lang: 'zh-CN',
  title: '鲸读 · DeepSeek 论文词汇',
  description: `${ST.papers} 篇 DeepSeek 技术报告 · 词汇学习 + 词汇朗读，逐词读懂论文`,
  appearance: false,
  // GitHub Pages 不做 URL 重写，cleanUrls 会让 /vocab 404（盘上只有 vocab.html）
  cleanUrls: false,
  lastUpdated: false,
  // 两份都是仓库文档，不是站点内容：README 讲怎么干活、DECISIONS 记定案史，
  // 都不该被编译成页面挂进站点（站点里已有 /papers /vocab /listen /notes 五页）
  srcExclude: ['README.md', 'DECISIONS.md'],
  head: [
    // 防刷新闪白：样式之前先把 data-theme 从 localStorage 落到 <html>。
    // 默认值与合法 id 名单都从 theme-defs.mjs 注入（不写死主题 id，否则改默认主题会闪一下旧主题）；
    // 存了个不存在的 id（改版前留下的）也回退到默认主题
    ['script', {}, `try{var ids=${JSON.stringify(THEMES.map(t => t.id))};var t=localStorage.getItem('portal_theme');` +
      `if(!t||ids.indexOf(t)<0)t=${JSON.stringify(DEFAULT_THEME)};` +
      `document.documentElement.setAttribute('data-theme',t);}catch(e){}`],
    // head 里的链接 VitePress 不会自动加 base，自己拼
    ['link', { rel: 'icon', href: BASE + 'favicon.svg' }],
  ],
  themeConfig: {
    nav: [
      // 2026-10-09 用户定案取消「总集」栏：三张总集页（词汇总集去重 / 听力全量 / 听力去重）
      // 已经挂在「词汇学习」与「词汇朗读」顶部横幅上，再占一个导航位是重复入口
      { text: '首页', link: '/' },
      { text: '论文总览', link: '/papers' },
      { text: '词汇学习', link: '/vocab' },
      { text: '词汇朗读', link: '/listen' },
      // 2026-10-09 用户要求新增：每篇一份笔记，正文是仓内 notes/<编号>_<短名>.md（空白也能点进去）
      { text: '学习笔记', link: '/notes' },
      // 2026-10-09 用户要求：放在「词汇朗读」右边，点出去站外画廊（新标签）
      { text: '模型架构', link: LLM_GALLERY },
    ],
    sidebar: {},
    outline: false,
    footer: {
      // 页脚只留站名＋规模，不写内部口径（「十一档词表…全量重做」这类用户明确不要）
      copyright: `鲸读 · ${ST.papers} 篇 DeepSeek 技术报告的核心词汇`,
    },
    search: { provider: 'local' },
  },
})
