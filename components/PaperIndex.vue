<script setup>
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'   // GitHub Pages 站点在 /deepseek-words/ 子路径下，根绝对路径必须过 withBase
import papers from '../data/papers.json'
import ms from '../data/master.json'      // 总集统计（merge_all.py 产出），文案不写死数字
import CATS from '../data/note-cats.json' // 子栏分类真源（label 与顺序）

const props = defineProps({
  mode: { type: String, default: 'both' },   // both | vocab | listen | note | arxiv
})

/* 笔记“写没写”：构建期直接读 notes/*.md 原文（import.meta.glob 的 ?raw），
   去掉 frontmatter 后正文为空就是未写。
   这样你往 md 里写几个字刷新站点就变，不需要重新生成任何 json。
   判空口径与 scripts/gen-notes.mjs 一致（那边有注释说明）。
   2026-10-25 用户要求专题统一目录管理：卡片不再靠 notes/ 顶层的壳页，
   而是直接读 notes/zhuanti-search/index.md 与子目录的 index.md（卡面元数据写在自己 frontmatter） */
const NOTE_SRC = import.meta.glob(
  ['../notes/*.md', '../notes/zhuanti-search/index.md', '../notes/zhuanti-search/*/index.md'],
  { query: '?raw', eager: true, import: 'default' })
const NOTE_BLANK = new Set(Object.entries(NOTE_SRC)
  .filter(([, src]) => !String(src).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim())
  .map(([k]) => k.split('/').pop().replace(/\.md$/, '')))
const noteHref = (p) => withBase('/notes/' + p.dir + '.html')
const written = (p) => !NOTE_BLANK.has(p.dir)

/* frontmatter 单行取值（卡面元数据用；都是一行字符串，不引 yaml 库） */
const fmValue = (src, key) => {
  const fm = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const hit = fm && fm[1].match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
  return hit ? hit[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim() : ''
}

/* 专题卡（2026-10-25 用户要求「专题的东西统一目录管理」）：
   卡源 = notes/ 顶层不带 NN_ 前缀的 md（位置编码、解读资源等）+ zhuanti-search 的 index.md 与各子目录 index.md。
   卡片的封面金句 / 排序 / 封面图名都写在正文自己的 frontmatter 里（cover / coverKicker / coverYear /
   order / coverFile），不再另外维护顶层壳页；href 按路径形判定（子目录 index → 目录地址，顶层 → <名>.html） */
const TOPICS = Object.entries(NOTE_SRC)
  .map(([k, src]) => {
    const key = k.replace(/^\.\.\/notes\//, '').replace(/\.md$/, '').replace(/\/index$/, '')
    return { key, isDir: /\/index\.md$/.test(k), src }
  })
  // 无编号前缀 = 专题；notes/index.md 是 tab 页本身、notes/papers.md 是兼容跳转粧，都不上墙
  .filter(({ key }) => !/^\d\d_/.test(key) && key !== 'index' && key !== 'papers')
  .map(({ key, isDir, src }) => {
    const slug = fmValue(src, 'coverFile') || key.split('/').pop()
    return {
      dir: key,
      title: fmValue(src, 'title') || key,
      href: withBase('/notes/' + (isDir ? key + '/' : key + '.html')),
      cover: withBase('/covers/T_' + slug + '.png'),
      // order：组内权重，越小越前；没写就是 500
      order: Number(fmValue(src, 'order')) || 500,
      category: fmValue(src, 'category') || '',
    }
  })
  .sort((a, b) => a.order - b.order || a.dir.localeCompare(b.dir))

/* 分类筛选（2026-10-26）：页内子栏条的二级行点分类 → URL 带 ?cat=xxx → 卡片墙只留这一类。
   ⚠ VitePress 的 useRoute() 只有 path / data / params，**没有 query**，而且同页只换 query
   不会重新挂载组件，所以在 setup 里同步读不到；改成挂载时自己读 location.search
   （二级链接带 target="_self" → 整页重载，每次都会重跑）。
   ⚠ 筛选用「加 .is-off 隐藏」而不是「从数组里删掉」：SSR 渲的是全量卡片，
   若客户端 setup 直接删元素会造成水合不一致（Vue 会报 hydration mismatch）。 */
const cat = ref('')
onMounted(() => {
  cat.value = new URLSearchParams(window.location.search).get('cat') || ''
})
const catLabel = computed(() => {
  for (const col of Object.values(CATS.columns)) {
    const hit = col.cats.find((c) => c.key === cat.value)
    if (hit) return hit.label
  }
  return cat.value
})
const catHref = computed(() => withBase(props.mode === 'topic' ? '/notes/cases/' : '/notes/'))
const isOffPaper = (p) => cat.value && p.category !== cat.value
const isOffTopic = (t) => cat.value && t.category !== cat.value
const visibleCount = computed(() => {
  if (!cat.value) return props.mode === 'topic' ? TOPICS.length : papers.length
  return props.mode === 'topic'
    ? TOPICS.filter((t) => t.category === cat.value).length
    : papers.filter((p) => p.category === cat.value).length
})

const sortBy = ref('num')       // num | words | time

/* 官方入口卡（2026-10-25 定案，2026-10-26 按用户要求调顺序）：论文总览页最前面两张站外官方入口。
   ① GitHub 官方组织仓库（青瓷 #0E7C86）② HF 官方论文库（撞色黄 #FFD21E）。
   2026-10-26 用户定案：「HF 的关注论文库放在仓库的右边吧，它这个颜色没有官方开源仓库
   这个颜色重，颜色重的看起来放左边更合适」——即从左到右按视觉重量由重到轻排。
   卡面照抄 covers3 的海报层级：顶部 mono 小标 → 品牌标识 → 中文衬线金句 → 强调短横 → 底部 mono 域名；
   右上角是「置顶」小三角，字平行于斜边（45°）。整张卡是外链 <a>，按钮只能是 <span>（不能嵌套 <a>）。
   数字 45 是 2026-10-25 取自 GitHub API 的 public_repos 当时值，仓库数会涨，需要时改这里。 */
const GH_MARK = 'M6.766 11.328c-2.063-.25-3.516-1.734-3.516-3.656 0-.781.281-1.625.75-2.188-.203-.515-.172-1.609.063-2.062.625-.078 1.468.25 1.968.703.594-.187 1.219-.281 1.985-.281.765 0 1.39.094 1.953.265.484-.437 1.344-.765 1.969-.687.218.422.25 1.515.046 2.047.5.593.766 1.39.766 2.203 0 1.922-1.453 3.375-3.547 3.64.531.344.89 1.094.89 1.954v1.625c0 .468.391.734.86.547C13.781 14.359 16 11.53 16 8.03 16 3.61 12.406 0 7.984 0 3.563 0 0 3.61 0 8.031a7.88 7.88 0 0 0 5.172 7.422c.422.156.828-.125.828-.547v-1.25c-.219.094-.5.156-.75.156-1.031 0-1.64-.562-2.078-1.609-.172-.422-.36-.672-.719-.719-.187-.015-.25-.093-.25-.187 0-.188.313-.328.625-.328.453 0 .844.281 1.25.86.313.452.64.655 1.031.655s.641-.14 1-.5c.266-.265.47-.5.657-.656'
const OFFICIAL = [
  {
    key: 'gh',
    href: 'https://github.com/orgs/deepseek-ai/repositories',
    title: '官方开源仓库 · GitHub',
    kicker: 'ORG · 45 REPOS',
    mark: GH_MARK,
    markType: 'svg',
    lines: ['引擎、内核、配方，', '官方仓库全公开。'],
    url: 'github.com/deepseek-ai',
    btn: '前往 GitHub 仓库 ↗',
    skin: 'teal',
  },
  {
    key: 'hf',
    href: 'https://huggingface.co/deepseek-ai/papers',
    title: '官方论文库 · Hugging Face',
    kicker: '00 · OFFICIAL INDEX',
    mark: '🤗',
    markType: 'emoji',
    lines: ['官方论文全收录，', '一个链接全直达。'],
    url: 'huggingface.co/deepseek-ai/papers',
    btn: '前往 HF 论文页 ↗',
    skin: 'yellow',
  },
]

/* 说明行跟着页面口径走：词汇页没有朗读入口，别写成「听读」 */
const hint = computed(() => {
  if (props.mode === 'vocab') return ' · 看词 / 写笔记'
  if (props.mode === 'listen') return ' · 逐词连播'
  if (props.mode === 'note') return ' · 每篇一份笔记'
  if (props.mode === 'arxiv') return ' · 点卡片直达 arXiv 原文'
  return ' · 看词 / 听读 / 笔记'
})

/* 论文总览页（mode='arxiv'）：整卡外链 arXiv 原文。32 篇都有 arXiv 号；
   万一哪篇没有，回退到 HF 官方论文库，绝不给死链 */
const arxivHref = (p) => p.arxiv
  ? 'https://arxiv.org/abs/' + p.arxiv
  : 'https://huggingface.co/deepseek-ai/papers'

/* 搜索已移到顶栏「找论文」弹窗（PaperSearch.vue），这里只负责排序 */
const list = computed(() => {
  const r = papers.slice()   /* 分类筛选不改这个数组：靠卡面上的 .is-off 隐藏（见上），否则会水合不一致 */
  if (sortBy.value === 'words') {
    r.sort((a, b) => b.words - a.words)
  } else if (sortBy.value === 'time') {
    /* 「按时间」= arXiv 编号前 6 位（YYMM.NNNNN，即发布年月+日），
       定长数字串按字符比就等于按时间比，所以直接比字符串，不必转 Date。
       方向取「新→旧」：编号本身就是时间正序（01=2401 月 … 32=2609 月），
       若也给「旧→新」那和「按编号」一模一样，这个选项就没有存在意义。 */
    const k = (p) => String(p.arxiv || '')
    r.sort((a, b) => (k(a) < k(b) ? 1 : k(a) > k(b) ? -1 : 0))
  } else {
    r.sort((a, b) => a.num.localeCompare(b.num))
  }
  return r
})

/* 总集入口：只在词汇页/听力页显示（首页 both 不显），点标题下方的箭头直达全局页 */
const master = computed(() => {
  if (props.mode === 'vocab')
    return { icon: '📖', label: '总览全局',
      desc: `全部 ${ms.papers} 篇去重词汇，一页通览 · ${ms.dedupWords} 词`,
      href: withBase('/study/master/词汇总集_去重.html'), alt: null }
  if (props.mode === 'listen')
    return { icon: '▶', label: '全部朗读',
      desc: `从第 ${ms.firstNum} 篇一路连播到第 ${ms.lastNum} 篇 · ${ms.totalWords} 词次`,
      href: withBase('/study/master/听力总集_全量连播.html'),
      alt: { text: `去重连播 · ${ms.dedupWords} 词`, href: withBase('/study/master/听力总集_去重连播.html') } }
  return null
})
</script>

<template>
  <div class="dr-lib">
    <div v-if="master" class="dr-master">
      <a class="dr-m-main" :href="master.href" target="_self">
        <span class="dr-m-ico">{{ master.icon }}</span>
        <span class="dr-m-txt"><b>{{ master.label }}</b><i>{{ master.desc }}</i></span>
        <span class="dr-m-arrow">→</span>
      </a>
      <a v-if="master.alt" class="dr-m-alt" :href="master.alt.href" target="_self">{{ master.alt.text }} →</a>
    </div>
    <!-- 专题案例页（mode='topic'，2026-10-25 新增子栏）：只出专题卡墙，不排 32 篇论文卡，
         也就没有编号/词数/时间可排——排序下拉整块隐掉。 -->
    <div class="dr-tools">
      <p v-show="cat" class="dr-hint dr-filter">正在看 <b>{{ catLabel }}</b> · {{ visibleCount }} 篇 · <a :href="catHref">看全部</a></p>
      <p v-if="!cat && mode === 'topic'" class="dr-hint">{{ TOPICS.length }} 张专题卡 · 封面是这篇的核心判断，点进去是正文</p>
      <p v-else-if="!cat" class="dr-hint">{{ papers.length }} 篇技术报告{{ hint }}</p>
      <label v-if="mode !== 'topic'" class="dr-sort">
        <span>排序</span>
        <select v-model="sortBy">
          <option value="num">按编号</option>
          <option value="words">按词数</option>
          <option value="time">按时间（新→旧）</option>
        </select>
      </label>
    </div>

    <div class="dr-grid">
      <!-- 官方入口卡（2026-10-25）：两张站外官方入口，整卡外链。
           2026-10-25 用户定案：从学习笔记页挪到论文总览页顶部（mode='arxiv'），
           排在 32 张 arXiv 卡之前；学习笔记页不再显示。
           整卡是外链 <a>，所以里面的"按钮"是 <span>（不能嵌套 <a>）。
           卡面用 CSS 直绘（矢量文字，任意 DPR 清晰），不新增 PNG、不动 covers 生成流水线。 -->
      <template v-if="mode === 'arxiv'">
        <a
          v-for="o in OFFICIAL"
          :key="o.key"
          class="dr-card is-official"
          :href="o.href"
          target="_blank"
          rel="noreferrer"
        >
          <div class="dr-pin" :class="{ 'is-invert': o.skin === 'teal' }"><i></i><b>置顶</b></div>
          <div class="dr-card-media dr-official" :class="'is-' + o.skin">
            <div class="dr-official-frame"></div>
            <div class="dr-official-kicker">{{ o.kicker }}</div>
            <div class="dr-official-mark">
              <span v-if="o.markType === 'emoji'">{{ o.mark }}</span>
              <svg v-else viewBox="0 0 16 16" width="26" height="26" fill="currentColor" aria-hidden="true">
                <path :d="o.mark" />
              </svg>
            </div>
            <div class="dr-official-line">
              <span v-for="(l, i) in o.lines" :key="i">{{ l }}</span>
            </div>
            <div class="dr-official-rule"></div>
            <div class="dr-official-url">{{ o.url }}</div>
          </div>
          <div class="dr-card-body">
            <h3 class="dr-card-nm">{{ o.title }}</h3>
            <div class="dr-acts">
              <span class="dr-go o">{{ o.btn }}</span>
            </div>
          </div>
        </a>
      </template>

      <!-- 卡片同步自 MotionFace 原型（design/20261020_MotionFace风格）：金句封面海报 + 英文题 + 三键。
           编号 / 短名 / 年份都画在封面图内（covers3 生成，图随 public/covers 进仓），卡面不再重复 -->
      <!-- 论文卡：同步自 MotionFace 原型（design/20261020_MotionFace风格）：金句封面海报 + 英文题 + 三键。
           编号 / 短名 / 年份都画在封面图内（covers3 生成，图随 public/covers 进仓），卡面不再重复。
           mode='arxiv'（论文总览页用）时整卡是外链 <a> 直达 arXiv 原文，按钮用 <span>（不能嵌套 <a>）；
           其余模式下卡体是 <div>，三键各自是站内链接 -->
      <template v-if="mode !== 'topic'">
      <template v-for="p in list" :key="p.num">
        <a
          v-if="mode === 'arxiv'"
          class="dr-card is-paper"
          :class="{ 'is-off': isOffPaper(p) }"
          :href="arxivHref(p)"
          target="_blank"
          rel="noreferrer"
        >
          <div
            class="dr-card-media" role="img" :aria-label="p.num + ' · ' + p.short + ' 金句封面'"
            :style="{ backgroundImage: `url(${withBase('/covers/' + p.num + '_' + p.short + '.png')})` }"
          ></div>
          <div class="dr-card-body">
            <h3 class="dr-card-nm">{{ p.title }}</h3>
            <div class="dr-acts">
              <span class="dr-go o">论文原文 ↗</span>
            </div>
          </div>
        </a>
        <div v-else class="dr-card is-paper" :class="{ 'is-off': isOffPaper(p) }">
        <div
          class="dr-card-media" role="img" :aria-label="p.num + ' · ' + p.short + ' 金句封面'"
          :style="{ backgroundImage: `url(${withBase('/covers/' + p.num + '_' + p.short + '.png')})` }"
        ></div>
        <div class="dr-card-body">
          <h3 class="dr-card-nm">{{ p.title }}</h3>
          <div class="dr-acts">
            <a v-if="mode !== 'listen' && mode !== 'note'" class="dr-go v" :href="withBase(p.vocabPath)" target="_self">词汇学习</a>
            <a v-if="mode !== 'vocab' && mode !== 'note'" class="dr-go l" :href="withBase(p.listenPath)" target="_self">词汇朗读</a>
            <a class="dr-go n" :href="noteHref(p)" target="_self">学习笔记<i v-if="mode === 'note' && !written(p)" class="dr-nb">未写</i></a>
          </div>
        </div>
        </div>
      </template>
      </template>

      <!-- 专题案例页（2026-10-25）：原先挂在 /notes 末尾的「专题与索引」组整体搬到 /notes/cases/。
           /notes 现在只留 32 篇论文卡，顶部有子栏 tab 条（components/NoteTabs.vue）指过去。
           卡源口径没变：notes/ 顶层不带 NN_ 前缀的 md + zhuanti-search 总览与各子目录 index.md。 -->
      <template v-if="mode === 'topic' && TOPICS.length">
        <a v-for="t in TOPICS" :key="t.dir" class="dr-card is-topic" :class="{ 'is-off': isOffTopic(t) }" :href="t.href" target="_self">
          <div
            class="dr-card-media" role="img" :aria-label="t.title + ' 封面'"
            :style="{ backgroundImage: `url(${t.cover})` }"
          ></div>
          <div class="dr-card-body">
            <h3 class="dr-card-nm">{{ t.title }}</h3>
            <div class="dr-acts">
              <span class="dr-go n">读专题</span>
            </div>
          </div>
        </a>
      </template>
    </div>

    <div v-if="!list.length || (cat && !visibleCount)" class="dr-empty">没有匹配的论文，换个关键词试试。</div>
  </div>
</template>
