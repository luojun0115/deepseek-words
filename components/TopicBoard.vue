<script setup>
/* 专题案例页的版式（2026-10-25 用户要求：「这个设计太差了，你给我搞一下」）。
 *
 * 老版式是 PaperIndex 的 mode='topic'：10 张一样的「16:10 海报 + 标题 + 读专题」网格卡，
 * 看上去就是一排贴图墙——没有「专题」和「篇目」的层次，也没有专题感。
 *
 * 新版式按「一个专题 = 一个板块」来排：
 *   板块头（彩色眉标 + 专题名 + 篇数）
 *   ├ 头牌：左封面图 + 右 眉标/标题/金句/年份/进入按钮
 *   └ 篇目目录：一行一篇（彩色序号块 + 标题 + 金句 + 年份 + 箭头）
 *
 * 卡源口径没变（与 PaperIndex 原 TOPICS 一致）：
 *   notes/ 顶层不带 NN_ 前缀的 md + zhuanti-search/index.md（专题总览）+ 各子目录 index.md（篇目）
 */
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { PALETTE } from '../scripts/covers-style.mjs'

const SRC = import.meta.glob(
  ['../notes/*.md', '../notes/zhuanti-search/index.md', '../notes/zhuanti-search/*/index.md'],
  { query: '?raw', eager: true, import: 'default' })

/* frontmatter 单行取值（不引 yaml 库：这些字段都是一行字符串） */
const fmValue = (src, key) => {
  const fm = String(src).match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const hit = fm && fm[1].match(new RegExp('^' + key + ':\\s*(.+)$', 'm'))
  return hit ? hit[1].trim().replace(/^(['"])([\s\S]*)\1$/, '$2').trim() : ''
}

/* 标题拆两段：「缩放定律 01 · Kaplan 2020：Scaling Laws for Neural Language Models」
   → 主「缩放定律 01 · Kaplan 2020」/ 副「Scaling Laws for Neural Language Models」（英文原题）
   副段用全角冒号切；没有冒号就是单段标题。 */
const splitTitle = (t) => {
  const i = t.indexOf('：')
  const zh = (i >= 0 ? t.slice(0, i) : t).trim()
  const en = (i >= 0 ? t.slice(i + 1) : '').trim()
  const no = (zh.match(/(\d{2})/) || [])[1] || ''
  return { zh, en, no }
}

const TOPICS = Object.entries(SRC)
  .map(([k, src]) => {
    const key = k.replace(/^\.\.\/notes\//, '').replace(/\.md$/, '').replace(/\/index$/, '')
    return { key, isDir: /\/index\.md$/.test(k), src }
  })
  // 无编号前缀 = 专题；notes/index.md 是 tab 页本身、notes/papers.md 是兼容跳转粧，都不上墙
  .filter(({ key }) => !/^\d\d_/.test(key) && key !== 'index' && key !== 'papers')
  .map(({ key, isDir, src }) => {
    const slug = fmValue(src, 'coverFile') || key.split('/').pop()
    return {
      key,
      group: key.split('/')[0],          // 专题归属：'zhuanti-search' 或顶层专题名
      isHead: key.indexOf('/') < 0,      // 没有子路径 = 专题总览（头牌）
      title: fmValue(src, 'title') || key,
      href: withBase('/notes/' + (isDir ? key + '/' : key + '.html')),
      cover: withBase('/covers/T_' + slug + '.png'),
      // 金句里的「 / 」是封面断句标记（封面图里渲染成换行），文本里也按行拆开
      quoteLines: fmValue(src, 'cover').split('/').map((s) => s.trim()).filter(Boolean),
      kicker: fmValue(src, 'coverKicker'),
      year: fmValue(src, 'coverYear'),
      order: Number(fmValue(src, 'order')) || 500,
    }
  })
  .sort((a, b) => a.order - b.order || a.key.localeCompare(b.key))

/* 按专题分组：一个专题一块。组内第一张（专题总览）当头牌，其余是篇目行。
   将来加了新专题，这里自动多出一块，版式不用改。 */
const GROUPS = computed(() => {
  const byGroup = new Map()
  for (const t of TOPICS) {
    if (!byGroup.has(t.group)) byGroup.set(t.group, [])
    byGroup.get(t.group).push(t)
  }
  return [...byGroup.values()].map((list) => {
    const head = list.find((t) => t.isHead) || list[0]
    const items = list.filter((t) => t !== head)
    const name = head.title.replace(/\s*[（(]\s*\d+\s*篇\s*[)）]\s*$/, '')
    return {
      key: head.group,
      name,
      kicker: head.kicker,
      quoteLines: head.quoteLines,
      year: head.year,
      cover: head.cover,
      href: head.href,
      isIndex: head.isHead,
      count: items.length,
      items: items.map((t, i) => ({
        ...t,
        no: splitTitle(t.title).no || String(i + 1).padStart(2, '0'),
        zh: splitTitle(t.title).zh,
        en: splitTitle(t.title).en,
        color: PALETTE[(i + 1) % PALETTE.length],   // 序号块配色：色盘轮换
      })),
    }
  })
})
</script>

<template>
  <div class="dr-topic">
    <section v-for="(g, gi) in GROUPS" :key="g.key" class="dr-tg">
      <!-- 板块头 -->
      <header class="dr-tg-hd">
        <span class="dr-tg-no" :style="{ background: g.items.length ? PALETTE[gi % PALETTE.length].deep : 'var(--dr-accent)' }">
          专题 {{ String(gi + 1).padStart(2, '0') }}
        </span>
        <h2 class="dr-tg-name">{{ g.name }}</h2>
        <span class="dr-tg-meta">{{ g.count ? g.count + ' 篇精读' : '单篇' }}<template v-if="g.year"> · {{ g.year }}</template></span>
      </header>

      <!-- 头牌：左封面 + 右说明 -->
      <a class="dr-tg-hero" :href="g.href" target="_self">
        <div class="dr-tg-hero-media" :style="{ backgroundImage: `url(${g.cover})` }" role="img" :aria-label="g.name + ' 封面'"></div>
        <div class="dr-tg-hero-body">
          <p v-if="g.kicker" class="dr-tg-hero-kicker">{{ g.kicker }}</p>
          <h3 class="dr-tg-hero-ttl">{{ g.name }}</h3>
          <p v-if="g.quoteLines.length" class="dr-tg-hero-quote">
            <span v-for="(l, i) in g.quoteLines" :key="i">{{ l }}</span>
          </p>
          <p class="dr-tg-hero-cta">{{ g.isIndex ? '进入专题总览' : '读这一篇' }} <i>→</i></p>
        </div>
      </a>

      <!-- 篇目目录 -->
      <ol v-if="g.items.length" class="dr-tg-list">
        <li v-for="it in g.items" :key="it.key">
          <a class="dr-tg-row" :href="it.href" target="_self">
            <span class="dr-tg-row-no" :style="{ background: it.color.deep }">{{ it.no }}</span>
            <span class="dr-tg-row-txt">
              <span class="dr-tg-row-ttl">{{ it.zh }}</span>
              <span v-if="it.en" class="dr-tg-row-en">{{ it.en }}</span>
              <span v-if="it.quoteLines.length" class="dr-tg-row-quote">
                <span v-for="(l, i) in it.quoteLines" :key="i">{{ l }}</span>
              </span>
            </span>
            <span class="dr-tg-row-lead"></span>
            <span class="dr-tg-row-year">{{ it.year }}</span>
            <span class="dr-tg-row-arrow">→</span>
          </a>
        </li>
      </ol>
    </section>

    <div v-if="!GROUPS.length" class="dr-empty">还没有专题，先写一篇 notes/ 下的专题笔记吧。</div>
  </div>
</template>