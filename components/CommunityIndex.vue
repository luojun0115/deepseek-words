<script setup>
// 社区大学索引（2026-10-26 用户要求新增的顶栏栏目，插在「学习笔记」右侧）。
//
// 收的是**别人做的**成系列解读：一辑＝一套完整的课/系列，辑内按观看顺序排布，
// 卡片直链原视频（新标签）。跟「学习笔记＝自己逐篇写的笔记」是两种来源，不混放。
//
// 数据真源 = data/community.json（scripts/gen-community-covers.mjs 读同一份画封面）。
// 版式沿用 2026-10-25 那版「专题研究」设计稿：期号纸签 → 淡色辑面板 → 卡片网格。
import { withBase } from 'vitepress'
import { computed, ref } from 'vue'
import DATA from '../data/community.json'

/* 时长：不足 1 小时写 m:ss（跟 B 站进度条一致），满 1 小时才带小时位 */
const fmtDur = (s) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return h ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}` : `${m}:${String(sec).padStart(2, '0')}`
}
const fmtViews = (n) => (n >= 10000 ? `${(n / 10000).toFixed(1)} 万` : String(n))
/* 辑的总时长：纸签上念的是「共 6 集 · 2 小时 7 分」，秒数四舍五入到分 */
const fmtSpan = (secs) => {
  const total = secs.reduce((a, e) => a + e.dur, 0)
  const h = Math.floor(total / 3600)
  const m = Math.round((total % 3600) / 60)
  return h ? `${h} 小时 ${m} 分` : `${m} 分钟`
}

const issues = DATA.issues.map((iss) => {
  const eps = iss.episodes.map((e) => ({
    ...e,
    // UP 主默认跟辑走；一辑里混了多位 UP（如第叁辑是两位 UP 各一条）时写在集上覆盖
    up: e.up || iss.up,
    dur: fmtDur(e.dur),
    views: fmtViews(e.views),
    href: `https://www.bilibili.com/video/${e.bvid}/`,
    cover: withBase('/covers/' + e.cover),
  }))
  const ups = [...new Set(eps.map((e) => e.up))]
  return {
    ...iss,
    eps,
    // 纸签上念的是「辑名（共 N 集）总时长」——2026-10-26 用户定案把辑标题提到纸签上、
    // 放在集数左边，辑面板头部就不再重复标题，只留那一行主线。
    count: eps.length,
    span: fmtSpan(iss.episodes),
    // 单 UP 的辑给「UP 主空间 ›」链接；多 UP 的辑只把名字列出来，不给一个任意的链接
    more: ups.length === 1 ? `https://space.bilibili.com/${eps[0].mid || iss.mid}` : null,
    ups: ups.join(' · '),
  }
})

/* 排序只作用在「辑」这一层——2026-10-26 用户特别叮嘱：「这个排序是对所有的专辑，
   我现在有第壹辑，以后可能还有第贰第叁第肆第伍辑」，不是排辑里的集。
   集永远按观看顺序（第 1 集在最前），翻上来会毁掉追更的读法。
   数据里的书写顺序就是添加顺序（老→新，新辑往后追加），所以：
     new（默认）＝ 最新 ＝ 最近添加那辑在上 ＝ 把书写顺序反过来
     old        ＝ 最早 ＝ 最早添加那辑（第壹辑）在上 ＝ 就按书写顺序
   标签 2026-10-26 定案：先写的「最热」被用户换成「最早」——"最热"会被当成按播放数排，
   而这两个按钮说的其实是添加时间的新旧，跟热度无关。 */
const order = ref('new')
const shown = computed(() => (order.value === 'new' ? [...issues].reverse() : issues))
const totalEps = issues.reduce((a, i) => a + i.count, 0)
</script>

<template>
  <div class="dr-lib cc">
    <div class="cc-tools">
      <span class="cc-count">共 <b>{{ issues.length }}</b> 辑 · <b>{{ totalEps }}</b> 集</span>
      <span class="cc-sort" role="group" aria-label="专辑排序">
        <button type="button" class="cc-sort-o" :class="{ 'is-on': order === 'new' }"
          :aria-pressed="order === 'new' ? 'true' : 'false'" title="最近添加的专辑在上" @click="order = 'new'">最新</button>
        <i class="cc-sort-sep" aria-hidden="true"></i>
        <button type="button" class="cc-sort-o" :class="{ 'is-on': order === 'old' }"
          :aria-pressed="order === 'old' ? 'true' : 'false'" title="最早添加的专辑在上（第壹辑起看）"
          @click="order = 'old'">最早</button>
      </span>
    </div>

    <section v-for="iss in shown" :key="iss.no" class="cc-issue">
      <span class="cc-chip">
        <b class="cc-chip-name">{{ iss.title }}</b>
        <span class="cc-chip-meta">（共 {{ iss.count }} 集） {{ iss.span }}</span>
        <i class="cc-chip-no">{{ iss.no }}</i>
      </span>
      <div class="cc-band">
        <div class="cc-band-hd">
          <p class="cc-line">{{ iss.sub }}</p>
          <a v-if="iss.more" class="cc-more" :href="iss.more" target="_blank" rel="noreferrer">UP 主空间 ›</a>
          <span v-else class="cc-more cc-ups" :title="'这一辑是多位 UP 的合集，不指向某一个空间'">{{ iss.ups }}</span>
        </div>
        <div class="dr-grid">
          <a
            v-for="e in iss.eps"
            :key="e.bvid"
            class="dr-card cc-card"
            :href="e.href"
            target="_blank"
            rel="noreferrer"
          >
            <div class="dr-card-media" role="img" :aria-label="e.title + ' 封面'" :style="{ backgroundImage: `url(${e.cover})` }">
              <span class="cc-strip"><b class="cc-bdg cc-bdg-l">第 {{ e.no }} 集</b><b class="cc-bdg cc-bdg-r">{{ e.dur }}</b></span>
            </div>
            <div class="dr-card-body">
              <h3 class="dr-card-nm">{{ e.title }}<i class="cc-ext">↗</i></h3>
              <p class="cc-sub">{{ e.up }} · {{ e.dur }} · {{ e.views }} 播放 · B 站</p>
            </div>
          </a>
        </div>
        <p class="cc-foot">
          播放数为 {{ iss.seenAt }} 采集的快照；点卡片直接跳 B 站原视频，站内不存正文。
        </p>
      </div>
    </section>
  </div>
</template>
