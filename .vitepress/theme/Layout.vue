<script setup>
import DefaultTheme from 'vitepress/theme'
import ThemeSwitcher from './ThemeSwitcher.vue'
import NoteHeader from './NoteHeader.vue'
import PaperSearch from '../../components/PaperSearch.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <PaperSearch />
      <ThemeSwitcher />
    </template>
    <!-- 笔记页页头：非 .vp-doc 内部（查过 VPDoc.vue，doc-before 是 main 的兄弟），
         所以不会破坏空白页的 `.vp-doc > div:empty` 轻提示选择器 -->
    <template #doc-before>
      <NoteHeader />
    </template>
  </DefaultTheme.Layout>
</template>
