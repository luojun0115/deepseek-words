// 全站主题单一真源（纯 ESM，Node 生成脚本与 Vite 都 import 它）。
// 每套主题的变量集固定；gen-theme-css.mjs 会校验齐全 + 校验对比度，不过即退出码 1。
// 数组顺序 = 顶栏那颗圆钮的循环顺序 = 数字键 1–0 的顺序，改顺序等于改键位。
export const THEME_VARS = [
  '--dr-bg', '--dr-bg2', '--dr-panel', '--dr-ink', '--dr-ink2', '--dr-line',
  '--dr-accent', '--dr-hi', '--dr-hi2', '--dr-on', '--dr-soft',
  '--dr-hf', '--dr-r', '--dr-bw',
]

export const THEMES = [
  {
    id: 'forest', name: '墨绿', dark: false,
    v: {
      '--dr-bg': '#f3f6f1', '--dr-bg2': '#e8efe6', '--dr-panel': '#ffffff',
      '--dr-ink': '#16301c', '--dr-ink2': '#4a5a4d', '--dr-line': '#d3ddce',
      '--dr-accent': '#2f6b3a', '--dr-hi': '#3a54d6', '--dr-hi2': '#a8321f',
      '--dr-on': '#ffffff', '--dr-soft': '#dcead9',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '10px', '--dr-bw': '1px',
    },
  },
  {
    id: 'default', name: '素白', dark: false,
    v: {
      '--dr-bg': '#ffffff', '--dr-bg2': '#f6f6f7', '--dr-panel': '#ffffff',
      '--dr-ink': '#1f2328', '--dr-ink2': '#5b6068', '--dr-line': '#e5e7eb',
      '--dr-accent': '#4f46e5', '--dr-hi': '#3a54d6', '--dr-hi2': '#b3261e',
      '--dr-on': '#ffffff', '--dr-soft': '#eef0ff',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '12px', '--dr-bw': '1px',
    },
  },
  {
    id: 'paper', name: '暖纸', dark: false,
    v: {
      '--dr-bg': '#f4f2ea', '--dr-bg2': '#ece8db', '--dr-panel': '#faf8f1',
      '--dr-ink': '#23211c', '--dr-ink2': '#6b6555', '--dr-line': '#ddd8ca',
      '--dr-accent': '#567038', '--dr-hi': '#3a54d6', '--dr-hi2': '#a3321e',
      '--dr-on': '#ffffff', '--dr-soft': '#e6ecd8',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '8px', '--dr-bw': '1px',
    },
  },
  {
    id: 'sea', name: '海青', dark: false,
    v: {
      '--dr-bg': '#eff6f7', '--dr-bg2': '#e2eff1', '--dr-panel': '#ffffff',
      '--dr-ink': '#0d2b31', '--dr-ink2': '#4a6a72', '--dr-line': '#cfe3e6',
      '--dr-accent': '#0e7490', '--dr-hi': '#3a54d6', '--dr-hi2': '#b3261e',
      '--dr-on': '#ffffff', '--dr-soft': '#d9ecef',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '12px', '--dr-bw': '1px',
    },
  },
  {
    id: 'wine', name: '枣红', dark: false,
    v: {
      '--dr-bg': '#fdf5f4', '--dr-bg2': '#f7e9e7', '--dr-panel': '#ffffff',
      '--dr-ink': '#331a1c', '--dr-ink2': '#7a5a5c', '--dr-line': '#eccfc9',
      '--dr-accent': '#a02c46', '--dr-hi': '#3a54d6', '--dr-hi2': '#8a5a00',
      '--dr-on': '#ffffff', '--dr-soft': '#f4dcd8',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '10px', '--dr-bw': '1px',
    },
  },
  {
    id: 'coffee', name: '咖啡', dark: false,
    v: {
      '--dr-bg': '#f7f2ea', '--dr-bg2': '#efe6d9', '--dr-panel': '#fffaf3',
      '--dr-ink': '#2b2119', '--dr-ink2': '#6f5f4d', '--dr-line': '#ded2c1',
      '--dr-accent': '#7a5230', '--dr-hi': '#3a54d6', '--dr-hi2': '#9a3412',
      '--dr-on': '#ffffff', '--dr-soft': '#ece0cf',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '8px', '--dr-bw': '1px',
    },
  },
  {
    // 叫「高对比」而不叫「黑白」：两种学法的按钮仍走全站固定的绿/橙语义（不随主题变），
    // 叫黑白会让人以为整页只剩黑白
    id: 'mono', name: '高对比', dark: false,
    v: {
      '--dr-bg': '#ffffff', '--dr-bg2': '#f2f2f2', '--dr-panel': '#ffffff',
      '--dr-ink': '#0a0a0a', '--dr-ink2': '#4b4b4b', '--dr-line': '#d4d4d4',
      '--dr-accent': '#111111', '--dr-hi': '#3a54d6', '--dr-hi2': '#b3261e',
      '--dr-on': '#ffffff', '--dr-soft': '#ebebeb',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '4px', '--dr-bw': '1px',
    },
  },
  {
    id: 'midnight', name: '深夜', dark: true,
    v: {
      '--dr-bg': '#0d1117', '--dr-bg2': '#0a0d12', '--dr-panel': '#161b22',
      '--dr-ink': '#e6edf3', '--dr-ink2': '#9aa4b2', '--dr-line': '#2a3038',
      '--dr-accent': '#58a6ff', '--dr-hi': '#7aa2f7', '--dr-hi2': '#ffb570',
      '--dr-on': '#0d1117', '--dr-soft': '#1b2735',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '12px', '--dr-bw': '1px',
    },
  },
  {
    id: 'indigo', name: '靛蓝', dark: true,
    v: {
      '--dr-bg': '#0f172a', '--dr-bg2': '#0b1220', '--dr-panel': '#172033',
      '--dr-ink': '#e2e8f0', '--dr-ink2': '#94a3b8', '--dr-line': '#26334d',
      '--dr-accent': '#818cf8', '--dr-hi': '#7aa2f7', '--dr-hi2': '#fdba74',
      '--dr-on': '#0f172a', '--dr-soft': '#1e293b',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '14px', '--dr-bw': '1px',
    },
  },
  {
    id: 'pine', name: '松墨', dark: true,
    v: {
      '--dr-bg': '#0b1611', '--dr-bg2': '#08120d', '--dr-panel': '#122018',
      '--dr-ink': '#e3f0e6', '--dr-ink2': '#93a99a', '--dr-line': '#223329',
      '--dr-accent': '#5cbb7f', '--dr-hi': '#7aa2f7', '--dr-hi2': '#f0b072',
      '--dr-on': '#0b1611', '--dr-soft': '#17281d',
      '--dr-hf': 'Georgia, "Songti SC", serif', '--dr-r': '12px', '--dr-bw': '1px',
    },
  },
]

export const DEFAULT_THEME = 'forest'

/* 全站恒定的 signature 色：顶栏当前栏目胶囊 = MotionFace 原型的柠檬绿。
   十套主题各有自己的 accent，但顶栏这颗「柠檬糖」不跟主题走——
   和「黑色页脚恒定锚点」是同一个思路（§B9）：页面主体随主题呼吸，顶栏这一颗始终认得出。
   它是恒定值而不是每套主题各配，所以不进 THEME_VARS（那儿是逐套校验的变量），
   但照样走真源 + 对比度门禁：gen-theme-css.mjs 会单独校这一对。 */
export const SIGNATURE = {
  '--dr-sig': '#d9f45f',
  '--dr-sig-ink': '#17211f',
}
