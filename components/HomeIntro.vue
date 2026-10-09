<script setup>
import { withBase } from 'vitepress'   // GitHub Pages 子路径下跳转需要带 base
import stats from '../data/master.json'   // 篇数由仓内 scripts/gen-data.py 从词汇页重推，文案不写死
</script>

<template>
  <div class="dr-intro">
    <p class="dr-intro-lead">{{ stats.papers }} 篇 DeepSeek 技术报告的核心词汇都在这里，每篇两种学法：</p>
    <div class="dr-ways">
      <a class="dr-way v" :href="withBase('/vocab.html')">
        <span class="dr-way-tag">词汇学习</span>
        <span class="dr-way-txt">按章节或按级别看词，可以像 PPT 一页一页过，每个词点着听发音</span>
        <span class="dr-way-go">→</span>
      </a>
      <a class="dr-way l" :href="withBase('/listen.html')">
        <span class="dr-way-tag">词汇朗读</span>
        <span class="dr-way-txt">逐词连播，可暂停调速、定时停止</span>
        <span class="dr-way-go">→</span>
      </a>
    </div>
  </div>
</template>
