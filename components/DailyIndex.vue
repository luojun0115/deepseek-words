<script setup>
// 每日一文索引（2026-10-25 用户要求新增的子栏）：
// 卡源 = notes/daily/*.md，一篇一个文件，frontmatter 写日期 / 标题 / 摘要 / 标签。
// 排序按日期倒序（新的一天在上）。页面自己就是一个「每日连载」的目录，
// 加新文只要往 notes/daily/ 里丢一个 md，不用改任何代码。
import { computed } from 'vue'
import { withBase } from 'vitepress'

const SRC = import.meta.glob('../notes/daily/*.md', { query: '?raw', eager: true, import: 'default' })

/* frontmatter 单行取值（与 PaperIndex.vue 同一套口径，不引 yaml 库） */
const fmValue = (src, key) => {
  const fm = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const hit = fm && fm[1].match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
  return hit ? hit[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim() : ''
}

const items = computed(() => Object.entries(SRC)
  .map(([k, src]) => {
    const file = k.replace(/^\.\.\/notes\/daily\//, '').replace(/\.md$/, '')
    const date = fmValue(src, 'date')
    return {
      file,
      date,
      day: date ? date.slice(8, 10) : '',          // 25
      mon: date ? date.slice(5, 7) : '',           // 10
      year: date ? date.slice(0, 4) : '',
      title: fmValue(src, 'title'),
      summary: fmValue(src, 'summary'),
      tags: fmValue(src, 'tags'),
      href: withBase('/notes/daily/' + file + '.html'),
    }
  })
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)))
</script>

<template>
  <div class="dr-daily">
    <div v-if="!items.length" class="dr-daily-empty">
      还没有文章。往 <code>notes/daily/</code> 里放一个 md 就会自动出现在这里。
    </div>
    <a v-for="it in items" :key="it.file" class="dr-daily-row" :href="it.href">
      <span class="dr-daily-date">
        <b>{{ it.day }}</b>
        <i>{{ it.year }}.{{ it.mon }}</i>
      </span>
      <span class="dr-daily-txt">
        <b class="dr-daily-nm">{{ it.title }}</b>
        <i class="dr-daily-sum">{{ it.summary }}</i>
        <i v-if="it.tags" class="dr-daily-tags">{{ it.tags }}</i>
      </span>
      <span class="dr-daily-go">读全文 ›</span>
    </a>
  </div>
</template>
