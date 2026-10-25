<script setup>
// 学习笔记三个子栏的切换条（2026-10-25 用户要求）：
//   全部笔记 /notes/ · 专题案例 /notes/cases/ · 每日一文 /notes/daily/
// 顶栏「学习笔记」已经是一个下拉（VitePress 的 nav items），这里再给一条页内 tab：
// 一来进页面就知道自己在哪一栏，二来触屏上顶栏 hover 下拉不好点，页内 tab 一直可点。
// 样式走本站语言：当前项 = 主题 accent + 短横，非当前项 = 次级字色。
import { withBase } from 'vitepress'

defineProps({
  active: { type: String, default: 'notes' },   // notes | cases | daily
})

const TABS = [
  { key: 'notes', text: '全部笔记', href: '/notes/' },
  { key: 'cases', text: '专题案例', href: '/notes/cases/' },
  { key: 'daily', text: '每日一文', href: '/notes/daily/' },
]
</script>

<template>
  <nav class="dr-subtabs" aria-label="学习笔记子栏">
    <a
      v-for="t in TABS"
      :key="t.key"
      class="dr-subtab"
      :class="{ 'is-on': active === t.key }"
      :href="withBase(t.href)"
      :aria-current="active === t.key ? 'page' : undefined"
    >{{ t.text }}</a>
  </nav>
</template>
