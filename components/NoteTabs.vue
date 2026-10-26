<script setup>
// 学习笔记三个子栏的两层导航（2026-10-26 用户定案「丁-3 · 纸的层叠」）：
//   一级＝三个栏目，做成纸签；二级＝该栏下的分类，坐在一条更浅的纸带上，
//   选中的那枚签压住纸带的边——分界不是画出来的，是两张纸的明度差。
//   二级项都能点：全部笔记 / 专题案例走 ?cat= 真筛选，每日一文直链到那 3 篇文章。
// 分类真源 = data/note-cats.json（label 与顺序），篇数从 papers.json 与专题 frontmatter 数出来。
import { computed, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'
import PAPERS from '../data/papers.json'
import CATS from '../data/note-cats.json'

const props = defineProps({
  active: { type: String, default: 'notes' },   // notes | cases | daily
})

/* 当前分类筛选（?cat=xxx）。
   ⚠ VitePress 的 useRoute() 只有 path / data / params，**没有 query**，而且同页只换 query
   不会重新挂载组件（route.component 是同一个模块），所以不能在 setup 里同步读到。
   办法：挂载时自己读一次 location.search；二级链接一律 target="_self"
   （带 target 属性的链接不被 VitePress 的点击拦截器接管 → 整页重载，onMounted 每次都跑）。 */
const cat = ref('')
onMounted(() => {
  cat.value = new URLSearchParams(window.location.search).get('cat') || ''
})

const COLS = Object.entries(CATS.columns).map(([key, c]) => ({ key, ...c }))

/* frontmatter 单行取值（与 PaperIndex.vue / DailyIndex.vue 同一套口径，不引 yaml 库） */
const fmValue = (src, key) => {
  const fm = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const hit = fm && fm[1].match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
  return hit ? hit[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim() : ''
}

/* 专题卡的分类计数（专题卡源 = notes/zhuanti-search 的总览与各子目录 index.md） */
const TOPIC_SRC = import.meta.glob(
  ['../notes/zhuanti-search/index.md', '../notes/zhuanti-search/*/index.md'],
  { query: '?raw', eager: true, import: 'default' })
const topicCount = computed(() => {
  const out = {}
  for (const src of Object.values(TOPIC_SRC)) {
    const c = fmValue(src, 'category')
    if (c) out[c] = (out[c] || 0) + 1
  }
  return out
})

/* 每日一文只有 3 篇，二级行直接列文章本身（直链正文，不做筛选） */
const DAILY_SRC = import.meta.glob('../notes/daily/*.md', { query: '?raw', eager: true, import: 'default' })
const dailyItems = computed(() => Object.entries(DAILY_SRC)
  .map(([k, src]) => {
    const file = k.replace(/^\.\.\/notes\/daily\//, '').replace(/\.md$/, '')
    const date = fmValue(src, 'date')
    return { file, date, title: fmValue(src, 'title') }
  })
  .filter((it) => it.file !== 'index' && it.date)
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)))

const countOf = (key) => (props.active === 'cases'
  ? (topicCount.value[key] || 0)
  : PAPERS.filter((p) => p.category === key).length)

/* 二级行：当前栏的分类（带篇数）或每日一文的 3 篇文章 */
const subs = computed(() => {
  const col = CATS.columns[props.active]
  if (props.active === 'daily') {
    return dailyItems.value.map((it) => ({
      key: it.file, label: it.title, n: 0,
      href: withBase('/notes/daily/' + it.file + '.html'),
      title: it.date,
    }))
  }
  const cur = cat.value
  return col.cats.map((c) => ({
    key: c.key,
    label: c.label,
    n: countOf(c.key),
    on: cur === c.key,
    href: withBase(col.href) + '?cat=' + c.key,
    self: true,   // 带 target 的链接不被 VitePress 拦截 → 整页重载，筛选才读得到新 query
    title: c.label + '（' + countOf(c.key) + ' 篇）',
  }))
})
</script>

<template>
  <nav class="dr-subtabs" :class="'nt-' + active" aria-label="学习笔记子栏">
    <div class="nt-l1">
      <a
        v-for="c in COLS"
        :key="c.key"
        class="nt-tab"
        :class="{ 'is-on': c.key === active }"
        :href="withBase(c.href)"
        :aria-current="c.key === active ? 'page' : undefined"
      ><i class="nt-dot" :style="{ background: c.color }"></i>{{ c.label }}</a>
    </div>
    <div class="nt-l2">
      <a
        v-for="s in subs"
        :key="s.key"
        class="nt-sub"
        :class="{ 'is-on': s.on }"
        :href="s.href"
        :target="s.self ? '_self' : undefined"
        :title="s.title || undefined"
      >{{ s.label }}<b v-if="s.n" class="nt-n">{{ s.n }}</b></a>
    </div>
  </nav>
</template>
