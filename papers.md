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
// 坑 2（2026-10-25）：跳转目标用 /papers/index.html 而不是 /papers/ ——
// vitepress preview 静态服务器会把 /papers/ 回退成 /papers.html（就是本页），
// 于是「本页跳 /papers/ → 又回退到本页」死循环（页面空白 + nodeType 报错）；
// GitHub Pages 会把 /papers/ 正确映射到 papers/index.html，两种都写 index.html 最稳。
// 坑：withBase 要直接从 'vitepress' 导入使用；之前写成 useData() 搭在 onMounted 回调里——
// 不在 setup 上下文，整段抛 TypeError，这个跳转从来没生效过（2026-10-25 实测修复）。
onMounted(() => {
  location.replace(withBase('/papers/index.html'))
})
</script>
