<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import stats from '../data/master.json'   // 篇数与词数由 scripts/gen-data.py 从词汇页重推，不写死

/* 十种艺术流派卡：内部结构各不相同，用 inner 存 HTML，交给 v-html。
   配色是卡片自身的一部分（不跟站内主题走），否则换主题时色块会失真。 */
const CARDS = [
  { k: 'fv', n: '野兽派', y: 'Fauvism · 1905',
    inner: '<span class="grain"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'cs', n: '构成主义', y: 'Constructivism · 1920s',
    inner: '<span class="tri"></span><span class="dot"></span><div class="band"><div class="t">DeepSeek is<br>all you need</div></div>' },
  { k: 'bh', n: '包豪斯', y: 'Bauhaus · 1919',
    inner: '<span class="c1"></span><span class="sq"></span><span class="tr"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ds', n: '风格派', y: 'De Stijl · 1917',
    inner: '<span class="r"></span><span class="y"></span><span class="b"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'pp', n: '波普艺术', y: 'Pop Art · 1960s',
    inner: '<div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'op', n: '欧普艺术', y: 'Op Art · 1960s',
    inner: '<div class="t">DeepSeek is all<br>you need</div>' },
  { k: 'mm', n: '孟菲斯', y: 'Memphis · 1981',
    inner: '<span class="zig"></span><span class="bar"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ad', n: '装饰艺术', y: 'Art Deco · 1925',
    inner: '<div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ink', n: '水墨', y: 'Ink · 东方',
    inner: '<div class="t">DeepSeek is<br>all you need</div><span class="seal">读透</span>' },
  { k: 'dd', n: '达达', y: 'Dada · 1916',
    inner: '<span class="s1"></span><span class="s2"></span><div class="t">DeepSeek is<br>all you need</div>' },
]

/* 按艺术史年代排，不是 DOM 顺序 */
const ORDER = [0, 9, 3, 2, 1, 7, 4, 5, 6, 8]
const deck = computed(() => ORDER.map((i) => CARDS[i]))

const cur = ref(0)      // 当前卡（从上方擦入）
const prev = ref(-1)    // 上一张：垫在新卡下面，等新卡盖满（520ms）再撤
let timer = null

function show(n) {
  prev.value = cur.value
  cur.value = n
  setTimeout(() => { prev.value = -1 }, 520)
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  timer = window.setInterval(() => {
    show((cur.value + 1) % deck.value.length)
  }, 2600)
})
onUnmounted(() => { if (timer) window.clearInterval(timer) })
</script>

<template>
  <section class="dr-hero">
    <!-- 左：报纸头版 -->
    <div class="dr-paper">
      <div class="dp-top">
        <span>DeepSeek · Paper Vocabulary</span>
        <span>Vol. {{ String(stats.papers).padStart(3, '0') }}</span>
      </div>
      <h1>百篇 <span class="hi">DeepSeek</span><br />论文与技术报告<br /><span class="hi2">一站读透</span></h1>
      <div class="dp-rule"></div>
      <p class="dp-deck">原文 / 词汇表 / 听力表 / 听力页 / 朗读页 / 精读笔记</p>
      <div class="dp-rule thin"></div>
      <div class="dp-foot">
        <p>
          已上线 <b class="sm">{{ stats.papers }}</b> 篇<span class="dot">·</span><b>{{ (stats.dedupWords || 0).toLocaleString() }}</b> 个去重核心词<span class="dot">·</span>全库 {{ (stats.totalWords || 0).toLocaleString() }} 词次
        </p>
        <span class="dp-links">
          <a :href="withBase('/vocab.html')">开始背词 →</a>
          <a class="quiet" :href="withBase('/papers.html')">看论文总览</a>
        </span>
      </div>
    </div>

    <!-- 右：艺术流派卡轮播 -->
    <div class="dr-hero-deck">
      <div class="deck">
        <div
          v-for="(c, i) in deck"
          :key="c.k"
          class="art-card"
          :class="[c.k, { on: i === cur, ghost: i === prev }]"
          v-html="c.inner"
        ></div>
      </div>
      <div class="deck-meta">
        <b>{{ deck[cur].n }}</b>
        <span class="yr">{{ deck[cur].y }}</span>
        <span class="cnt"><b>{{ cur + 1 }}</b> / {{ deck.length }}</span>
      </div>
    </div>
  </section>
</template>
