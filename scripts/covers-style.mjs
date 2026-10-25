// 全站封面视觉系统（2026-10-25 用户要求）
//
// 用户原话：「卡片的颜色都是黑的，给我的网站带来了一股邪气……最少要用 Claude Code 那种风格，
// 加一些多彩的元素，就不要那种纯黑的了，这种纯黑太难了，太让人觉得这个网站黑了、阴暗了」
//
// 这套系统取代老的 A/B/C 三风格（covers3/gen.cjs）：老系统的 A 风格是纯黑底 #0e0e0d，
// B 风格里有深绿/藏青/深灰，10 张专题卡里 6 张落在暗色区 → 整面卡墙是黑的。
// 新系统的三条硬规矩：
//   ① 底色永远是暖纸白系（#FBF7F0 / #FFFDF9 / 主色 12% 淡彩），没有一块纯黑。
//   ② 彩色只出现在图形元素上（竖条、引号、边框、角标、方块阵），正文永远是深墨 #241E17。
//      每个主色都配一个 deep 变体专供小字（mono 标、编号），保证对比度 ≥ 5.9:1。
//   ③ 8 色盘按卡片顺序轮换，同排相邻不同色 → 卡墙是多彩的，但每张仍有主色身份。
//
// Claude Code 的调性来源：暖米底 + 陶土橙品牌色 + 深棕墨字 + 克制的细边框 + 等宽标签。
// 这里是「Claude Code 那种风格 + 多彩」：橙是头牌色，其余 7 色让卡墙不单调。

export const PAPER = '#FBF7F0'      // 暖纸底
export const PAPER2 = '#FFFDF9'     // 亮纸底
export const INK = '#241E17'        // 深墨字
export const INK2 = '#574E43'       // 次级字
export const MUTE = '#8C8274'       // 弱化字

export const SERIF = 'Georgia, "Songti SC", "Noto Serif SC", "Times New Roman", serif'
export const SANS = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", sans-serif'
export const MONO = 'ui-monospace, Menlo, Consolas, monospace'

/* 8 色盘：main = 图形装饰色，deep = 小字色（对 PAPER 对比度全部 ≥5.9:1），soft = 淡彩底 */
export const PALETTE = [
  { key: 'terracotta', main: '#D97757', deep: '#9E4520', soft: '#F7E6DC' },  // 陶土橙（Claude 品牌色）
  { key: 'teal', main: '#0E7C86', deep: '#0A535C', soft: '#DCEFF0' },        // 青瓷
  { key: 'violet', main: '#7A63C8', deep: '#4F3B95', soft: '#E9E4F7' },      // 紫棠
  { key: 'mustard', main: '#C9931F', deep: '#7E5B08', soft: '#F7EDD5' },     // 姜黄
  { key: 'brick', main: '#B5483A', deep: '#7E2E23', soft: '#F6E1DD' },        // 砖红
  { key: 'olive', main: '#5C7F3E', deep: '#3C5724', soft: '#E4EDD9' },        // 橄榄
  { key: 'rose', main: '#C0457C', deep: '#8A2858', soft: '#F8E1EC' },        // 玫红
  { key: 'indigo', main: '#3A6BB0', deep: '#26497C', soft: '#DEE7F6' },      // 靛蓝
]

export const STYLES = ['L1', 'L2', 'L3']

/* 卡片顺序 → 配色 / 版式。
   色：i % 8（相邻必不同色）；版式：拉丁方错位（同排三张不同版式，沿用老 covers3 的思路）。 */
export function coverLook(i, { staggered = false } = {}) {
  const color = PALETTE[i % PALETTE.length]
  const style = staggered
    ? STYLES[(Math.floor(i / 3) + (i % 3)) % STYLES.length]
    : STYLES[Math.floor(i / STYLES.length) % STYLES.length]
  return { color, style }
}

/* 按最长一行的视觉宽度定字号（沿用老 covers3 的算法，保持同批封面字号手感一致） */
export function fitSize(lines) {
  const widthOf = (s) => [...s].reduce((n, ch) => n + (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(ch) ? 1 : 0.56), 0)
  const em = Math.max(...lines.map(widthOf))
  return Math.max(52, Math.min(78, Math.round(880 / em)))
}

const BASE = (W, H) => `*{margin:0;box-sizing:border-box}
    .cover{width:${W}px;height:${H}px;position:relative;overflow:hidden;
      display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}
    .top{position:absolute;left:0;right:0;top:52px;text-align:center;font:400 21px/1 ${MONO};letter-spacing:.12em}
    .bot{position:absolute;left:0;right:0;bottom:50px;text-align:center;font:400 20px/1 ${MONO};letter-spacing:.12em}
    .frame{position:absolute;inset:26px;pointer-events:none}
    .line{text-wrap:balance}
    .mk{font-family:${SERIF};font-weight:800;line-height:.8}`

/* 三套版式：
   L1 暖纸 · 色边   —— 左侧主色竖条 + 右上淡色大圆，最接近 Claude 的克制排版
   L2 淡彩 · 色框   —— 主色 12% 淡底 + 斜切角标 + 底部方块阵
   L3 亮纸 · 色签   —— 顶部主色横条 + 左上编号色块 + 底部条码阵 */
export function coverHTML({ style, lines, top, bot, color, num, W = 1200, H = 750 }) {
  const fs = fitSize(lines)
  const line = lines.join('<br>')
  const base = BASE(W, H)
  const c = color

  if (style === 'L1') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
      .cover{background:${PAPER};font-family:${SANS}}
      .cover::after{content:"";position:absolute;inset:0;opacity:.05;pointer-events:none;
        background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='2'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>")}
      .edge{position:absolute;left:0;top:0;bottom:0;width:18px;background:${c.main}}
      .blob{position:absolute;right:-120px;top:-140px;width:460px;height:460px;border-radius:50%;
        background:${c.main};opacity:.11}
      .frame{border:1px solid rgba(36,30,23,.10)}
      .mk{font-size:92px;color:${c.main};margin-bottom:10px}
      .line{font:600 ${fs}px/1.38 ${SERIF};color:${INK};letter-spacing:.005em;max-width:1000px;padding:0 40px}
      .rule{width:58px;height:4px;background:${c.main};border-radius:3px;margin-top:30px}
      .top{color:${c.deep};opacity:.82}
      .bot{color:${c.deep};opacity:.62}
    </style></head><body><div class="cover"><div class="blob"></div><div class="edge"></div><div class="frame"></div>
      <div class="mk">\u201C</div>
      <div class="line">${line}</div>
      <div class="rule"></div>
      <div class="top">${top}</div><div class="bot">${bot}</div>
    </div></body></html>`
  }

  if (style === 'L2') {
    return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
      .cover{background:${c.soft};font-family:${SANS}}
      .corner{position:absolute;right:0;top:0;width:236px;height:236px;
        background:${c.main};
        clip-path:polygon(100% 0, 100% 100%, 0 0)}
      .dots{position:absolute;right:34px;top:34px;width:104px;height:104px;
        background-image:radial-gradient(${PAPER2} 5.5px, transparent 6px);
        background-size:26px 26px;opacity:.9}
      .frame{border:1.5px solid ${c.main};opacity:.55}
      .mk{font-size:78px;color:${c.main};margin-bottom:10px}
      .line{font:600 ${fs}px/1.38 ${SERIF};color:${INK};max-width:980px;padding:0 40px}
      .rule{width:56px;height:4px;background:${c.deep};border-radius:3px;margin-top:28px}
      .bars{position:absolute;left:0;right:0;bottom:104px;display:flex;justify-content:center;gap:9px}
      .bars i{width:34px;height:7px;border-radius:2px;background:${c.main};display:block}
      .bars i:nth-child(2){opacity:.72}
      .bars i:nth-child(3){opacity:.5}
      .bars i:nth-child(4){opacity:.72}
      .bars i:nth-child(5){opacity:.34}
      .top{color:${c.deep};opacity:.86}
      .bot{color:${c.deep};opacity:.62}
    </style></head><body><div class="cover">
      <div class="corner"></div><div class="dots"></div><div class="frame"></div>
      <div class="mk">\u201C</div>
      <div class="line">${line}</div>
      <div class="rule"></div>
      <div class="bars"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="top">${top}</div><div class="bot">${bot}</div>
    </div></body></html>`
  }

  return `<!doctype html><html><head><meta charset="utf-8"><style>${base}
    .cover{background:${PAPER2};font-family:${SANS};align-items:flex-start;text-align:left;
      padding:0 78px}
    .topbar{position:absolute;left:0;right:0;top:0;height:12px;background:${c.main}}
    .badge{position:absolute;left:78px;top:96px;width:132px;height:132px;border-radius:20px;
      background:${c.deep};color:#fff;display:flex;align-items:center;justify-content:center;
      font:700 46px/1 ${MONO};letter-spacing:-.02em}
    .line{position:absolute;left:78px;right:78px;top:300px;text-align:left;
      font:600 ${fs}px/1.42 ${SERIF};color:${INK}}
    .rule{position:absolute;left:78px;top:300px;transform:translateY(-56px);
      width:58px;height:4px;background:${c.main};border-radius:3px}
    .codes{position:absolute;left:78px;right:78px;bottom:104px;display:flex;gap:8px;align-items:flex-end;height:26px}
    .codes i{display:block;width:16px;height:26px;border-radius:2px;background:${c.main};opacity:.85}
    .codes i:nth-child(3n){height:16px;opacity:.55}
    .codes i:nth-child(4n){height:32px;opacity:.7}
    .top{left:78px;right:78px;text-align:left;color:${c.deep};opacity:.8}
    .bot{left:78px;right:78px;text-align:left;color:${c.deep};opacity:.6}
  </style></head><body><div class="cover"><div class="topbar"></div>
    <div class="badge">${num}</div>
    <div class="rule"></div>
    <div class="line">${line}</div>
    <div class="codes">${'<i></i>'.repeat(14)}</div>
    <div class="top">${top}</div><div class="bot">${bot}</div>
  </div></body></html>`
}
