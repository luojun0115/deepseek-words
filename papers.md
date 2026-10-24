---
pageClass: wide
title: 论文总览
---

# 论文总览

本页已并入 [学习笔记 · 论文总览](/notes/papers.html)——32 篇 DeepSeek 技术报告的时间线、分主线清单与解读资源汇总都在那里。

<script setup>
import { onMounted } from 'vue'
import { useData } from 'vitepress'

// 旧址 /papers.html 自动跳到新址，避免收藏的链接失效
onMounted(() => {
  const { withBase } = useData()
  location.replace(withBase('/notes/papers.html'))
})
</script>
