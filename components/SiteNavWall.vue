<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import data from '../sites/sites.json'

/* 站外导航墙（方案 C · 积木墙）：十二组各占一行，组内砖块等宽、整行铺满，
   行与行之间宽度不同（3 块 / 8 块 / 7 块 / 6 块…）——这就是这面墙的「乱中有序」。
   砖块用各站品牌色，统一降饱和成一套褪色印刷色板，几十块因此不打架。 */

const GROUPS = data.groups
const SLOTS = data.slots

/* 品牌色 → 褪色印刷色板：降饱和、提亮到同一档，几十块并排不打架。
   块底色是「砖自己的颜色」，不跟站内主题走；块上文字统一用近黑，保证对比度。
   亮度下限 0.60 是量出来的：再暗（深红/深蓝那几家）块上文字就压不到 4.5:1。 */
function soften(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
  let h = 0
  const l = (mx + mn) / 2 / 255
  const d = mx - mn
  let s = d === 0 ? 0 : d / 255 / (1 - Math.abs(2 * l - 1))
  if (d !== 0) {
    if (mx === r) h = ((g - b) / d) % 6
    else if (mx === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return { h, s: Math.min(s, 0.55), l: Math.max(0.60, Math.min(l, 0.70)) }
}
const css = (hex) => {
  const c = soften(hex)
  return `hsl(${c.h.toFixed(0)} ${(c.s * 100).toFixed(0)}% ${(c.l * 100).toFixed(0)}%)`
}

/* 高度序列：两层的交替，高低参差但底边对齐（像砌墙）。
   长度 = 上墙总块数（加站时按同一节奏续写即可）。 */
const TALL = 152
const SHORT = 122
const PATTERN = [
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1, 2, 2, 1, 1, 2, 2, 2,
  1,
  2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 1, 1, 2, 2, 2, 1, 2, 2, 1, 1, 2,
]

let seq = 0
const rows = computed(() => GROUPS.map((g) => {
  const items = g.kind === 'slots'
    ? SLOTS.map((s) => ({ slot: true, name: s.name, hint: s.hint, short: s.name }))
    : data.sites.filter((s) => s.group === g.id).map((s) => ({
      slot: false,
      name: s.name,
      short: s.short,
      url: s.url,
      // dom：砖块上显示的域名。默认从 url 推导；带查询串的地址（如 ?page=1&type=hot）
      // 在数据里写 dom 字段覆盖，免得把整串查询参数写到砖块上
      domSrc: s.dom || '',
      brand: s.brand,
      logo: s.logo,
    }))
  return { group: g, items }
}))

/* 每行给砖块算好：色、高、歪一点的角度、编号 */
const courses = computed(() => {
  let no = 0
  return rows.value.map((row) => {
    const wide = row.items.length <= 4
    const items = row.items.map((it) => {
      const i = seq++
      const h = it.slot ? 104 : (wide ? 152 : (PATTERN[i] === 2 ? TALL : SHORT))
      const rot = it.slot ? 0 : ((i * 37) % 5 - 2) * 0.4
      return {
        ...it,
        no: it.slot ? '' : String(++no).padStart(2, '0'),
        color: it.slot ? '' : css(it.brand),
        dom: it.slot ? '' : (it.domSrc || it.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')),
        h,
        rot,
      }
    })
    return { ...row, wide, items }
  })
})

/* 抬头右侧的小色板：每组取一站代表色 */
const swatches = computed(() =>
  GROUPS.filter(g => g.kind === 'sites').map(g => {
    const s = data.sites.find(x => x.group === g.id)
    return css(s.brand)
  }))

const total = data.sites.length
const nGroups = GROUPS.filter(g => g.kind === 'sites').length
</script>

<template>
  <section class="dr-nav">
    <!-- 报眼 -->
    <div class="dp-top">
      <span>鲸读 JINGDU · DEEPSEEK PAPER VOCABULARY</span>
      <span>External Sites · {{ total }} Blocks</span>
    </div>

    <!-- 抬头 -->
    <div class="nav-mast">
      <div class="nav-mast-l">
        <h1>站外导航 · <em>{{ total }} 块积木</em></h1>
        <div class="dp-rule"></div>
        <p class="dp-deck">
          <b>论文源</b>在最上面一层，<b>大模型</b>紧随其后，
          <b>代码</b>、<b>算法</b>、<b>工具</b>、<b>课程</b>、<b>社区</b>、<b>开发者社区</b>、<b>媒体</b>、<b>数据</b>、<b>视频</b>一层压一层——像搭积木。
          点任意一块，直接跳到那个站。
        </p>
        <div class="dp-rule thin"></div>
      </div>
      <div class="nav-mast-r">
        <div class="nav-nums">
          <div><b>{{ total }}</b><span>BLOCKS</span></div>
          <div><b>{{ String(nGroups).padStart(2, '0') }}</b><span>GROUPS</span></div>
          <div><b>{{ String(SLOTS.length).padStart(2, '0') }}</b><span>SLOTS</span></div>
        </div>
        <div class="nav-swatches">
          <i v-for="(c, i) in swatches" :key="i" :style="{ background: c }"></i>
        </div>
      </div>
    </div>

    <!-- 墙：组牌在左列（不占垂直空间，砖墙才能一层压一层），砖行在右列 -->
    <div class="nav-wall">
      <template v-for="row in courses" :key="row.group.id">
        <div class="nav-plate">
          <span class="nm">{{ row.group.name }}</span>
          <span class="en">{{ row.group.en }}</span>
          <span class="ct">{{ String(row.items.length).padStart(2, '0') }}</span>
        </div>
        <div class="nav-row" :class="{ wide: row.wide }" :style="{ '--n': row.items.length }">
          <a
            v-for="it in row.items"
            :key="it.name"
            class="nav-blk"
            :class="{ ghost: it.slot }"
            :style="{ '--c': it.color, '--h': it.h + 'px', '--r': it.rot + 'deg' }"
            :href="it.slot ? undefined : it.url"
            :target="it.slot ? undefined : '_blank'"
            :rel="it.slot ? undefined : 'noreferrer'"
            :aria-label="it.slot ? it.hint : it.name"
            :title="it.slot ? it.hint : it.name"
          >
            <span v-if="it.no" class="no" aria-hidden="true">{{ it.no }}</span>
            <span class="side"></span>
            <span class="dot">
              <img v-if="!it.slot" :src="withBase(it.logo)" alt="" />
              <template v-else>＋</template>
            </span>
            <span class="txt">
              <span class="nm">{{ it.short }}</span>
              <span v-if="row.wide && !it.slot" class="dom">{{ it.dom }}</span>
            </span>
            <span v-if="!it.slot" class="go" aria-hidden="true">↗</span>
          </a>
        </div>
      </template>
    </div>

    <!-- 报尾 -->
    <div class="dp-foot">
      <p class="brand">
        <i v-for="(c, i) in swatches" :key="'b' + i" :style="{ background: c }"></i>
        <b>鲸读 JINGDU</b> · 一站读透
      </p>
      <span class="go">点积木直达对应网站 ↗ · {{ total }} BLOCKS · © 2026</span>
    </div>
  </section>
</template>
