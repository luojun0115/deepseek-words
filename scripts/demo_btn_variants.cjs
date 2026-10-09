// 临时 demo：首页卡片按钮 4 套配色对比截图（不落库，用户选定后写进 custom.css）
const { chromium } = require('playwright')
const V = {
  A_现状: '',
  B_轻量描边: `
    .dr-lib .dr-go.v { background: transparent; color: var(--dr-accent); border: 1.5px solid var(--dr-accent); }
    .dr-lib .dr-go.v:hover { background: var(--dr-accent); color: var(--dr-on); }
    .dr-lib .dr-go.l { background: transparent; color: var(--dr-ink2); border: 1.5px solid var(--dr-line); }
    .dr-lib .dr-go.l:hover { border-color: var(--dr-ink2); color: var(--dr-ink); }`,
  C_墨色对比: `
    .dr-lib .dr-go.v { background: var(--dr-ink); color: var(--dr-panel); }
    .dr-lib .dr-go.v:hover { background: var(--dr-accent); }
    .dr-lib .dr-go.l { background: var(--dr-bg2); color: var(--dr-ink); border: 1.5px solid var(--dr-line); }
    .dr-lib .dr-go.l:hover { border-color: var(--dr-accent); color: var(--dr-accent); }`,
  D_左角色条: `
    .dr-lib .dr-go { border-radius: 4px; padding: 8px 0; }
    .dr-lib .dr-go.v { background: var(--dr-bg2); color: var(--dr-ink); box-shadow: inset 3px 0 0 var(--dr-accent); }
    .dr-lib .dr-go.l { background: var(--dr-bg2); color: var(--dr-ink2); box-shadow: inset 3px 0 0 var(--dr-line); }
    .dr-lib .dr-go.v:hover { background: var(--dr-soft); }
    .dr-lib .dr-go.l:hover { background: var(--dr-soft); color: var(--dr-accent); box-shadow: inset 3px 0 0 var(--dr-accent); }`,
}
;(async () => {
  const b = await chromium.launch({ headless: true })
  for (const [name, css] of Object.entries(V)) {
    const p = await b.newPage({ viewport: { width: 1440, height: 900 } })
    await p.goto('http://localhost:4188/', { waitUntil: 'networkidle' })
    if (css) await p.addStyleTag({ content: css })
    await p.waitForTimeout(200)
    await p.locator('.dr-grid').first().screenshot({ path: 'previews/按钮_' + name + '.png' })
    console.log('✓', name)
    await p.close()
  }
  await b.close()
})()
