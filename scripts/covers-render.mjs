// 封面渲染的公共动作：起浏览器 + 出图（内容没变就不写盘，git 保持干净）
//
// 两个生成脚本共用：
//   scripts/gen-paper-covers.mjs  32 篇论文封面 → public/covers/NN_short.png
//   scripts/gen-topic-covers.mjs  专题笔记封面 → public/covers/T_<名>.png
//
// playwright 是全局装的（仓里没进 devDependencies），而 ESM 的 import 不认 NODE_PATH
// ——那是 CJS 的机制。用 createRequire 走回 require；仓内找不到就自己查全局根目录。
import { createRequire } from 'node:module'
import fs from 'node:fs'
import path from 'node:path'

const require = createRequire(import.meta.url)

export function loadPlaywright() {
  try {
    return require('playwright')
  } catch {
    const { execSync } = require('node:child_process')
    const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim()
    return require(path.join(globalRoot, 'playwright'))
  }
}

/* 无头 chromium 在本机会偶发 SIGSEGV（启动阶段就崩，与页面内容无关）；
   另外本机 ms-playwright 缓存的 chromium 版本与当前 playwright 不匹配时，
   chromium.launch() 会卡在「下载浏览器」。两级兜底：默认 → 系统已装的 Chrome。 */
export async function launchBrowser() {
  const { chromium } = loadPlaywright()
  for (let i = 0; i < 3; i++) {
    try {
      return await chromium.launch()
    } catch (e) {
      try {
        return await chromium.launch({ channel: 'chrome' })
      } catch (e2) {
        if (i === 2) throw e2
        console.warn(`  浏览器启动失败（第 ${i + 1} 次），重试…`)
        await new Promise((r) => setTimeout(r, 500))
      }
    }
  }
}

/* 出图并比字节：内容没变就丢掉临时文件，避免每次全量都改一遍 png 把 git 弄脏。
   临时名必须以 .png 结尾——playwright 按扩展名推断图片格式，`.png.tmp` 会报 unsupported mime type。 */
export async function shoot(page, html, out, W, H, force = false) {
  await page.setContent(html, { waitUntil: 'load' })
  const tmp = out.replace(/\.png$/, '.tmp.png')
  await page.screenshot({ path: tmp, clip: { x: 0, y: 0, width: W, height: H } })
  const same = !force && fs.existsSync(out) && fs.readFileSync(out).equals(fs.readFileSync(tmp))
  if (same) {
    fs.unlinkSync(tmp)
    return false
  }
  fs.renameSync(tmp, out)
  return true
}
