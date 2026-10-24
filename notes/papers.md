---
pageClass: wide
title: 论文总览
---

# 论文总览

本页已并入 [论文总览](/papers/)——32 篇 DeepSeek 技术报告的时间线、分主线清单与解读资源都在那里。

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

// 兼容桩（2026-10-25）：论文总览页在 10-24~10-25 曾住在 notes/papers.md，地址是
// /notes/papers.html；页面搬进 papers/ 文件夹后这个地址会 404，缓存页 / 旧收藏还会指它。
// 注意：本文件在 notes/ 里，会被 PaperIndex 的专题 glob 扫到 ——
// TOPICS / gen-topic-covers / gen-notes 都把 papers.md 与 index.md 排除掉了，它不会变成卡片。
onMounted(() => {
  location.replace(withBase('/papers/'))
})
</script>
