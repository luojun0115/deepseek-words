<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'   // GitHub Pages 站点在 /deepseek-words/ 子路径下，根绝对路径必须过 withBase
import papers from '../data/papers.json'
import ms from '../data/master.json'      // 总集统计（merge_all.py 产出），文案不写死数字

const props = defineProps({
  mode: { type: String, default: 'both' },   // both | vocab | listen | note
})

/* 笔记“写没写”：构建期直接读 notes/*.md 原文（import.meta.glob 的 ?raw），
   去掉 frontmatter 后正文为空就是未写。
   这样你往 md 里写几个字刷新站点就变，不需要重新生成任何 json。
   判空口径与 scripts/gen-notes.mjs 一致（那边有注释说明）。 */
const NOTE_SRC = import.meta.glob('../notes/*.md', { query: '?raw', eager: true, import: 'default' })
const NOTE_BLANK = new Set(Object.entries(NOTE_SRC)
  .filter(([, src]) => !String(src).replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '').trim())
  .map(([k]) => k.split('/').pop().replace(/\.md$/, '')))
const noteHref = (p) => withBase('/notes/' + p.dir + '.html')
const written = (p) => !NOTE_BLANK.has(p.dir)

const sortBy = ref('num')       // num | words

/* 说明行跟着页面口径走：词汇页没有朗读入口，别写成「听读」 */
const hint = computed(() => {
  if (props.mode === 'vocab') return ' · 看词 / 写笔记'
  if (props.mode === 'listen') return ' · 逐词连播'
  if (props.mode === 'note') return ' · 每篇一份笔记'
  return ' · 看词 / 听读 / 笔记'
})

/* 搜索已移到顶栏「找论文」弹窗（PaperSearch.vue），这里只负责排序 */
const list = computed(() => {
  const r = papers.slice()
  r.sort((a, b) => sortBy.value === 'words'
    ? b.words - a.words
    : a.num.localeCompare(b.num))
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
    <div class="dr-tools">
      <p class="dr-hint">{{ papers.length }} 篇技术报告{{ hint }}</p>
      <label class="dr-sort">
        <span>排序</span>
        <select v-model="sortBy">
          <option value="num">按编号</option>
          <option value="words">按词数</option>
        </select>
      </label>
    </div>

    <div class="dr-grid">
      <!-- 卡片同步自 MotionFace 原型（design/20261020_MotionFace风格）：金句封面海报 + 英文题 + 三键。
           编号 / 短名 / 年份都画在封面图内（covers3 生成，图随 public/covers 进仓），卡面不再重复 -->
      <div v-for="p in list" :key="p.num" class="dr-card">
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
    </div>

    <div v-if="!list.length" class="dr-empty">没有匹配的论文，换个关键词试试。</div>
  </div>
</template>
