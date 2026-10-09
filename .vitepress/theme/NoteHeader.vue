<script setup>
// 笔记页页头（2026-10-09 新增）：notes/*.md 只有 frontmatter 时，页面上连一句标题都没有，
// 点进去像白屏。所以由主题层按 URL 反查 data/papers.json，补一条「哪一篇 + 返回笔记索引」。
// 关键：md 一个字节都不写，PaperIndex.vue / gen-notes.mjs 的「写没写」判空口径保持纯净。
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'
import papers from '../../data/papers.json'

const route = useRoute()
// /notes/01_DeepSeek-LLM.html（带 base）→ '01_DeepSeek-LLM'；索引页 /notes.html 不匹配
const dir = computed(() => (route.path.match(/\/notes\/([^/]+?)(?:\.html)?$/) || [])[1] || '')
const paper = computed(() => papers.find((p) => p.dir === dir.value) || null)
</script>

<template>
  <div v-if="paper" class="dr-note-hd">
    <span class="dr-note-num">{{ paper.num }}</span>
    <span class="dr-note-txt">
      <b>{{ paper.short }}</b>
      <i>{{ paper.title }}</i>
    </span>
    <a class="dr-note-back" :href="withBase('/notes.html')">← 笔记索引</a>
  </div>
</template>
