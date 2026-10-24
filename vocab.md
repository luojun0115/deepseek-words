---
pageClass: wide
title: 词汇学习
---

# 词汇学习

本页已并入 [词汇学习](/vocab/)——32 篇 DeepSeek 技术报告的词汇学习页都在那里。

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

// 旧址 /vocab.html 自动跳到新址（2026-10-25 各 tab 目录化），避免收藏的链接失效。
// withBase 直接从 'vitepress' 导入（不能把 useData() 搭在 onMounted 回调里——不在 setup 上下文会抛错）。
onMounted(() => {
  location.replace(withBase('/vocab/'))
})
</script>
