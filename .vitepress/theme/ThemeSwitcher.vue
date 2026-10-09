<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { THEMES, DEFAULT_THEME } from './theme-defs.mjs'

const idx = ref(THEMES.findIndex(t => t.id === DEFAULT_THEME))
// 数字键位 = THEMES 数组下标（主题多于 10 套就得换方案，下面那条断言会提醒）
const KEY_MAP = '1234567890'

const cur = computed(() => THEMES[idx.value] || THEMES[0])

function apply(i) {
  idx.value = ((i % THEMES.length) + THEMES.length) % THEMES.length
  const id = THEMES[idx.value].id
  document.documentElement.setAttribute('data-theme', id)
  try { localStorage.setItem('portal_theme', id) } catch (e) {}
}

function onKey(e) {
  if (e.metaKey || e.ctrlKey || e.altKey) return
  const tag = (e.target && e.target.tagName) || ''
  if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target && e.target.isContentEditable)) return
  const i = KEY_MAP.indexOf(e.key)
  if (i >= 0 && i < THEMES.length) apply(i)
}

onMounted(() => {
  let id = DEFAULT_THEME
  try { id = localStorage.getItem('portal_theme') || DEFAULT_THEME } catch (e) {}
  const i = THEMES.findIndex(t => t.id === id)
  if (i >= 0) idx.value = i
  document.documentElement.setAttribute('data-theme', THEMES[idx.value].id)
  addEventListener('keydown', onKey)
})
onUnmounted(() => removeEventListener('keydown', onKey))
</script>

<template>
  <!-- 2026-10-09 用户要求：顶栏不显示主题名文字，点一下就换。色块本身就是提示，
       名字只放在 title（悬停才出）与 aria-label 里；shift+点击回上一套，数字键直达。 -->
  <button class="pt-cycle"
          :aria-label="'换背景（当前：' + cur.name + '，共 ' + THEMES.length + ' 套）'"
          :title="'换背景：当前「' + cur.name + '」，共 ' + THEMES.length + ' 套（也可按数字键 1–0，shift+点击回上一套）'"
          @click="apply(idx + ($event.shiftKey ? -1 : 1))">
    <span class="pt-dot" :style="{
      background: 'linear-gradient(135deg, ' + cur.v['--dr-accent'] + ' 0 50%, ' + cur.v['--dr-bg2'] + ' 50% 100%)',
      boxShadow: 'inset 0 0 0 1px ' + cur.v['--dr-line'] }"></span>
  </button>
</template>

<style scoped>
.pt-cycle {
  display: inline-flex; align-items: center; justify-content: center;
  width: 30px; height: 30px; padding: 0; cursor: pointer;
  background: var(--dr-panel); border: 1px solid var(--dr-line);
  border-radius: 50%; margin-left: 8px;
  transition: border-color .15s, transform .15s;
}
.pt-cycle:hover { border-color: var(--dr-accent); transform: rotate(-15deg); }
.pt-cycle:active { transform: rotate(-15deg) scale(.92); }
.pt-dot {
  width: 16px; height: 16px; border-radius: 50%;
}
</style>
