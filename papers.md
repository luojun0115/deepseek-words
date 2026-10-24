---
pageClass: wide
title: 论文总览
---

# 论文总览

本页已并入 [论文总览](/papers/)——32 篇 DeepSeek 技术报告的 时间线、分主线清单与解读资源汇总都在那里。

<script setup>
import { onMounted } from 'vue'
import { withBase } from 'vitepress'

// 旧址 /papers.html 自动跳到新址（2026-10-25 papers/ 文件夹），避免收藏的链接失效。
// 坑：withBase 要直接从 'vitepress' 导入使用；之前写成 useData() 搭在 onMounted 回调里——
// 不在 setup 上下文，整段抛 TypeError，这个跳转从来没生效过（2026-10-25 实测修复）。
onMounted(() => {
  location.replace(withBase('/papers/'))
})
</script>
