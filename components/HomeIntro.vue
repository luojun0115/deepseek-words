<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import stats from '../data/master.json'   // 篇数与词数由 scripts/gen-data.py 从词汇页重推，不写死

/* 十种艺术流派卡：内部结构各不相同，用 inner 存 HTML，交给 v-html。
   配色是卡片自身的一部分（不跟站内主题走），否则换主题时色块会失真。 */
const CARDS = [
  { k: 'fv', n: '野兽派', y: 'Fauvism · 1905',
    inner: '<span class="grain"></span>' },
  { k: 'cs', n: '构成主义', y: 'Constructivism · 1920s',
    inner: '<span class="tri"></span><span class="dot"></span><div class="band"><div class="t">DeepSeek is all you need</div></div>' },
  { k: 'bh', n: '包豪斯', y: 'Bauhaus · 1919',
    inner: '<span class="c1"></span><span class="sq"></span><span class="tr"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ds', n: '风格派', y: 'De Stijl · 1917',
    inner: '<span class="r"></span><span class="y"></span><span class="b"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'pp', n: '波普艺术', y: 'Pop Art · 1960s',
    inner: '<span class="burst"></span>' },
  { k: 'op', n: '欧普艺术', y: 'Op Art · 1960s',
    inner: '' },
  { k: 'mm', n: '孟菲斯', y: 'Memphis · 1981',
    inner: '<span class="zig"></span><span class="bar"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ad', n: '装饰艺术', y: 'Art Deco · 1925',
    inner: '<div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'ink', n: '水墨', y: 'Ink · 东方',
    inner: '<div class="t">DeepSeek is<br>all you need</div><span class="seal"></span>' },
  { k: 'dd', n: '达达', y: 'Dada · 1916',
    inner: '<span class="s1"></span><span class="s2"></span><div class="t">DeepSeek is<br>all you need</div>' },
  /* ↓ 大字报 / 宣传画四张：苏联构成、大跃进、手写大字报、剪纸宣传栏 */
  { k: 'soviet', n: '苏联构成宣传', y: 'Soviet Poster · 1920s',
    inner: '<span class="rays"></span><span class="disc"></span><span class="bar"></span>' },
  { k: 'dagu', n: '大跃进宣传画', y: 'China · 1958',
    inner: '<span class="rays"></span><span class="sun"></span>' },
  { k: 'handbill', n: '手写大字报', y: 'Handbill · 1960s',
    inner: '<span class="burst"></span><div class="t">为人民服务</div><div class="sub">DEEPSEEK IS ALL YOU NEED</div>' },
  { k: 'papercut', n: '剪纸宣传栏', y: 'Paper Cut · 1980s',
    inner: '<span class="scallop"></span><span class="scallop b"></span><span class="dots"></span><div class="t">万篇论文</div><div class="sub">DEEPSEEK IS ALL YOU NEED</div>' },
  /* ↓ 全谱系第一批：浮世绘、巴洛克、洛可可、印象派、点彩派、新艺术、立体主义、故障艺术 */
  { k: 'ukiyoe', n: '浮世绘', y: 'Ukiyo-e · 1830s',
    inner: '<span class="sea"></span><span class="wave"></span><span class="wave2"></span><span class="mtn"></span><span class="sun"></span><span class="seal">北斎</span>' },
  { k: 'baroque', n: '巴洛克', y: 'Baroque · 1650s',
    inner: '<span class="arch l"></span><span class="arch r"></span><span class="beam"></span><span class="rosace"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'rococo', n: '洛可可', y: 'Rococo · 1730s',
    inner: '<span class="shell"></span><span class="shell2"></span><span class="petal"></span>' },
  { k: 'impressionism', n: '印象派', y: 'Impressionism · 1870s',
    inner: '<span class="s1"></span><span class="s2"></span><span class="s3"></span><span class="dapple"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'pointillism', n: '点彩派', y: 'Pointillism · 1880s',
    inner: '<span class="dots"></span><span class="bloom"></span>' },
  { k: 'artnouveau', n: '新艺术', y: 'Art Nouveau · 1890s',
    inner: '<span class="stem"></span><span class="stem2"></span><span class="leaf"></span>' },
  { k: 'cubism', n: '立体主义', y: 'Cubism · 1910s',
    inner: '<span class="f1"></span><span class="f2"></span><span class="f3"></span>' },
  { k: 'glitch', n: '故障艺术', y: 'Glitch · 1990s',
    inner: '<span class="scan"></span><span class="bars"></span><span class="blocks"></span>' },
  /* ↓ 全谱系第二批：洞穴壁画、彩陶、古埃及、古希腊陶瓶、拜占庭、敦煌壁画、罗马式、哥特彩窗 */
  { k: 'caveman', n: '洞穴壁画', y: 'CAVE PAINTING · 40000 BCE',
    inner: '<span class="rock"></span><span class="torch"><i class="hd"></i><i class="bd"></i><i class="al"></i><i class="ar"></i><i class="ll"></i><i class="lr"></i></span><span class="stroke"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'caitao', n: '彩陶纹样', y: 'PAINTED POTTERY · 5000 BCE',
    inner: '<span class="swirl"></span><span class="band"></span>' },
  { k: 'egypt', n: '古埃及', y: 'EGYPT · 3000 BCE',
    inner: '<span class="g1"></span><span class="g2"></span><span class="g3"></span><span class="g4"></span><span class="eye"></span><span class="head"></span><span class="fig"></span><span class="arm l"></span><span class="arm r"></span>' },
  { k: 'greekvase', n: '古希腊陶瓶', y: 'GREEK VASE · 2500 BCE',
    inner: '<span class="meander"></span><span class="meander b"></span><span class="fig"></span><span class="ear l"></span><span class="ear r"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'byzantine', n: '拜占庭金马赛克', y: 'BYZANTINE · 500',
    inner: '<span class="mosaic"></span><span class="saint"></span>' },
  { k: 'dunhuang', n: '敦煌壁画', y: 'DUNHUANG · 700',
    inner: '<span class="ribbon"></span><span class="fly"></span>' },
  { k: 'romanesque', n: '罗马式', y: 'ROMANESQUE · 1000',
    inner: '<span class="stone"></span><span class="arch"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'gothic', n: '哥特彩窗', y: 'GOTHIC · 1250',
    inner: '<span class="arch a1"></span><span class="arch a2"></span><span class="arch a3"></span><span class="rose"></span>' },
  /* ↓ 全谱系第三批：文艺复兴、威尼斯画派、荷兰黄金时代、新古典主义、浪漫主义、现实主义、后印象派、象征主义 */
  { k: 'renaissance', n: '文艺复兴', y: 'RENAISSANCE · 1400',
    inner: '<span class="ground"></span><span class="rays"></span><span class="arch"></span><span class="dome"></span>' },
  { k: 'venetian', n: '威尼斯画派', y: 'VENETIAN · 1500',
    inner: '<span class="frame"></span><span class="glow"></span>' },
  { k: 'dutchgolden', n: '荷兰黄金时代', y: 'DUTCH GOLDEN · 1650',
    inner: '<span class="light"></span><span class="weave"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'neoclassic', n: '新古典主义', y: 'NEOCLASSIC · 1780',
    inner: '<span class="pilaster l"></span><span class="pilaster r"></span><span class="disc"></span>' },
  { k: 'romanticism', n: '浪漫主义', y: 'ROMANTICISM · 1820',
    inner: '<span class="storm"></span><span class="flash"></span>' },
  { k: 'realism', n: '现实主义', y: 'REALISM · 1850',
    inner: '<span class="sky"></span><span class="field"></span><span class="furrow"></span><span class="farmer"></span><span class="tree"></span>' },
  { k: 'postimpressionism', n: '后印象派', y: 'POST-IMPRESSIONISM · 1890',
    inner: '<span class="swirl"></span><span class="star"></span>' },
  { k: 'symbolism', n: '象征主义', y: 'SYMBOLISM · 1890',
    inner: '<span class="halo"></span><span class="moth"></span><span class="branch"></span>' },
  /* ↓ 全谱系第四批：泥金手抄本、纳斯卡、波斯浮雕、伊斯兰几何、唐三彩、青绿山水、工艺美术、墨西哥壁画 */
  { k: 'illumination', n: '泥金手抄本', y: 'ILLUMINATION · 1200',
    inner: '<span class="parch"></span><span class="vine"></span><span class="leaf"></span><span class="drop"></span>' },
  { k: 'nascapaint', n: '纳斯卡线条', y: 'NASCA · 500 BCE',
    inner: '<span class="lines"></span><span class="bird"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'persianrelief', n: '古波斯浮雕', y: 'PERSIAN RELIEF · 500 BCE',
    inner: '<span class="sky"></span><span class="wing l"></span><span class="wing r"></span><span class="body"></span><span class="tail"></span>' },
  { k: 'islamic', n: '伊斯兰几何', y: 'ISLAMIC · 800',
    inner: '<span class="star"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'tangsancai', n: '唐三彩', y: 'TANG SANCAI · 700',
    inner: '<span class="glaze"></span><span class="camel"><i class="hump"></i><i class="head"></i></span>' },
  { k: 'bluegreen', n: '青绿山水', y: 'BLUE-GREEN · 1100',
    inner: '<span class="mountain"></span><span class="mountain2"></span><span class="gold"></span>' },
  { k: 'artsandcrafts', n: '工艺美术', y: 'ARTS & CRAFTS · 1880',
    inner: '<span class="wall"></span><span class="leafy"></span>' },
  { k: 'muralism', n: '墨西哥壁画', y: 'MEXICAN MURALISM · 1920',
    inner: '<span class="rock"></span><span class="worker"></span><span class="hat"></span><div class="t">DeepSeek is all you need</div>' },
  /* ↓ 全谱系第五批：罗马马赛克、高丽青瓷、蒙古岩画、超现实、抽象表现、瑞士国际主义、日本海报、超级波普、极简、扁平、生成艺术 */
  { k: 'romanmosaic', n: '罗马马赛克', y: 'ROMAN MOSAIC · 100',
    inner: '<span class="tiles"></span><div class="t">万篇论文</div>' },
  { k: 'mongolrock', n: '蒙古岩画', y: 'MONGOL ROCK · 1200',
    inner: '<span class="horse"></span><span class="wing l"></span><span class="wing r"></span><span class="stroke"></span><div class="t">DeepSeek is all you need</div>' },
  { k: 'celadon', n: '高丽青瓷', y: 'CELADON · 1150',
    inner: '<span class="bowl"></span><span class="crack"></span>' },
  { k: 'surrealism', n: '超现实主义', y: 'SURREALISM · 1924',
    inner: '<span class="plain"></span><span class="clock"></span>' },
  { k: 'abstractexp', n: '抽象表现主义', y: 'ABSTRACT EXP · 1947',
    inner: '<span class="drip"></span><span class="web"></span><div class="t">DeepSeek is<br>all you need</div>' },
  { k: 'superpop', n: '超级波普', y: 'SUPERPOP · 1962',
    inner: '<span class="can"></span><span class="dots"></span>' },
  { k: 'minimalism', n: '极简主义', y: 'MINIMALISM · 1965',
    inner: '<span class="line"></span>' },
  { k: 'japanposter', n: '战后日本海报', y: 'JAPAN POSTER · 1955',
    inner: '<span class="sun"></span><span class="wave"></span><div class="t">DeepSeek</div>' },
  { k: 'flatdesign', n: '扁平设计', y: 'FLAT DESIGN · 2010',
    inner: '<span class="circle"></span><span class="square"></span><span class="tri"></span>' },
  { k: 'swissgrid', n: '瑞士国际主义', y: 'SWISS STYLE · 1950',
    inner: '<span class="grid"></span><span class="bar"></span><div class="sub">Grid · Type · Contrast</div>' },
  { k: 'genart', n: '生成艺术', y: 'GENERATIVE AI · 2020',
    inner: '<span class="field"></span><span class="grid"></span>' },
]

/* 按艺术史年代排，不是 DOM 顺序 */
const ORDER = [
  22, 23, 24, 25, 39, 40, 46, 26, 42, 27, 41, 28, 43, 47, 48, 38, 29,
  30, 31, 32, 15, 16, 33, 34, 14, 35, 17, 18, 44, 19, 36, 37,
  0, 20, 9, 3, 2, 1, 10, 45, 49, 7, 50, 51, 52, 11, 4, 5, 12, 53, 54,
  13, 6, 21, 55, 56, 8,
]
const deck = computed(() => ORDER.map((i) => CARDS[i]))

const cur = ref(0)      // 当前卡（从上方擦入）
const prev = ref(-1)    // 上一张：垫在新卡下面，等新卡盖满（520ms）再撤
const paused = ref(false)
let timer = null

function show(n) {
  prev.value = cur.value
  cur.value = n
  setTimeout(() => { prev.value = -1 }, 520)
}

/* 手动操作后重置计时器，让用户点的这张能停满一轮 */
function go(n) {
  show(n)
  restart()
}
function step(d) {
  go((cur.value + d + deck.value.length) % deck.value.length)
}
function restart() {
  if (timer) { window.clearInterval(timer); timer = null }
  if (paused.value) return
  timer = window.setInterval(() => {
    show((cur.value + 1) % deck.value.length)
  }, 2600)
}
/* 鼠标悬停时暂停轮播：22 张一轮 57 秒，不暂停的话看客根本来不及读 */
function setPaused(p) {
  if (paused.value === p) return
  paused.value = p
  restart()
}

onMounted(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return
  restart()
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
          <!-- 2026-10-24 用户定案取消「论文总览」栏：报头这枚入口改指学习笔记，
               论文总览已归档进 notes/papers.md（笔记索引页「专题与索引」组第一张卡） -->
          <!-- 2026-10-24 用户反馈「卡片左边的东西消失了」：论文总览入口不撤，与学习笔记并列 -->
          <a class="quiet" :href="withBase('/papers/')">看论文总览</a>
          <a class="quiet" :href="withBase('/notes.html')">看学习笔记</a>
        </span>
      </div>
    </div>

    <!-- 右：艺术流派卡轮播 -->
    <div
      class="dr-hero-deck"
      tabindex="0"
      @mouseenter="setPaused(true)"
      @mouseleave="setPaused(false)"
      @keydown.left.prevent="step(-1)"
      @keydown.right.prevent="step(1)"
    >
      <div class="deck">
        <div
          v-for="(c, i) in deck"
          :key="c.k"
          class="art-card"
          :class="[c.k, { on: i === cur, ghost: i === prev }]"
          v-html="c.inner"
        ></div>
        <button class="deck-arrow prev" type="button" aria-label="上一张流派卡" @click="step(-1)">‹</button>
        <button class="deck-arrow next" type="button" aria-label="下一张流派卡" @click="step(1)">›</button>
      </div>
      <div class="deck-meta">
        <b>{{ deck[cur].n }}</b>
        <span class="yr">{{ deck[cur].y }}</span>
        <span class="cnt"><b>{{ cur + 1 }}</b> / {{ deck.length }}</span>
      </div>
      <!-- 年代刻度尺：一张卡一个刻度，hover 看名字，点一下直接跳过去 -->
      <div class="deck-ticks">
        <button
          v-for="(c, i) in deck"
          :key="'tk' + c.k"
          type="button"
          class="tick"
          :class="{ on: i === cur }"
          :title="c.n + ' · ' + c.y"
          :aria-label="c.n + ' ' + c.y"
          @click="go(i)"
        ></button>
      </div>
    </div>
  </section>
</template>
