<script setup>
/* 顶栏「找论文」→ 居中弹窗，输入即筛，↑↓ 选、↵ 打开、esc 关。
   挂在 .vitepress/theme/Layout.vue 的 #nav-bar-content-after，全站可用。
   只做「论文」这一个维度（定位在 32 篇之间跳转），全文检索仍交给 VitePress 自带搜索。 */
import { ref, computed, nextTick } from 'vue'
import { withBase } from 'vitepress'
import papers from '../data/papers.json'

const open = ref(false)
const q = ref('')
const cur = ref(0)
const inputEl = ref(null)
const listEl = ref(null)
let lastFocus = null

const rows = computed(() => {
  const k = q.value.trim().toLowerCase()
  return papers
    .filter((p) => !k || (p.short + ' ' + p.title + ' ' + p.num + ' ' + p.arxiv).toLowerCase().includes(k))
    .sort((a, b) => a.num.localeCompare(b.num))
})

function show() {
  lastFocus = document.activeElement
  q.value = ''
  cur.value = 0
  open.value = true
  document.body.style.overflow = 'hidden'
  nextTick(() => inputEl.value && inputEl.value.focus())
}

function close() {
  open.value = false
  document.body.style.overflow = ''
  if (lastFocus && lastFocus.focus) lastFocus.focus()
}

function move(step) {
  const n = rows.value.length
  if (!n) return
  cur.value = (cur.value + step + n) % n
  nextTick(() => {
    const el = listEl.value && listEl.value.querySelector('.sm-item.on')
    if (el) el.scrollIntoView({ block: 'nearest' })
  })
}

function go() {
  const p = rows.value[cur.value]
  if (p) window.location.href = withBase(p.vocabPath)
}

function onKey(e) {
  if (e.key === 'Escape') { close(); return }
  if (e.key === 'ArrowDown') { e.preventDefault(); move(1) }
  else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1) }
  else if (e.key === 'Enter') { e.preventDefault(); go() }
}
</script>

<template>
  <button class="dr-find" type="button" aria-haspopup="dialog" title="搜索论文（按名称 / 编号 / arXiv）" @click="show">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h4" /><path d="M10 12h5M10 16h5" />
    </svg>
    <span>找论文</span>
  </button>

  <Teleport to="body">
    <div v-if="open" class="search-modal" role="dialog" aria-modal="true" aria-label="搜索论文" @keydown="onKey">
      <div class="sm-backdrop" @click="close"></div>
      <div class="sm-panel">
        <div class="sm-bar">
          <svg class="sm-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref="inputEl"
            v-model="q"
            type="text"
            placeholder="搜索论文名 / 编号 / arXiv"
            autocomplete="off"
            spellcheck="false"
            @input="cur = 0"
          />
          <button class="sm-esc" type="button" @click="close">ESC</button>
        </div>

        <div ref="listEl" class="sm-list">
          <a
            v-for="(p, i) in rows"
            :key="p.num"
            class="sm-item"
            :class="{ on: i === cur }"
            :href="withBase(p.vocabPath)"
            @mouseenter="cur = i"
          >
            <span class="n">{{ p.num }}</span>
            <span class="t">{{ p.title }}</span>
            <span class="y">{{ p.year }}</span>
          </a>
          <p v-if="!rows.length" class="sm-empty">没有匹配的论文，换个关键词试试。</p>
        </div>

        <div class="sm-foot">
          <span>{{ rows.length }} / {{ papers.length }} 篇</span>
          <span><kbd>↑</kbd><kbd>↓</kbd> 选择 · <kbd>↵</kbd> 打开 · <kbd>esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>
