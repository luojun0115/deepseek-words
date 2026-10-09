#!/usr/bin/env node
// 同步 listen_pages/ 与 vocab_pages/ 到门户 public/study/ 下：
//  1) 复制（排除 .DS_Store / .md）
//  2) 修链接：返回门户的入口统一写成**相对路径** ../../xxx.html（根绝对路径 /listen 在
//     GitHub Pages 的 /<repo>/ 子路径下会跳到用户站 404，相对路径则站点根在哪都能解析）；
//     给词汇页注入一个固定的「← 返回索引」浮标（词汇页模板本身没有返回入口）
//  3) 全量校验每个 href/src 是否落到真实文件，失效非 0 退出码 1
//  4) 写 .sync-manifest.json：记录每张仓内副本对应的**源页指纹**。源页在本仓库之外
//     （工作区 vocab_pages/ 等），CI 拿不到，所以「改了源页却忘了同步」这种事只能靠
//     这份指纹在本地判（verify_content.mjs 比对它，pre-push 钩子再拦一道）
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL = path.resolve(__dirname, '..')
// 源页目录默认取「门户目录的上一级」（工作区根）；换布局用 PAGES_ROOT 指过去
const ROOT = path.resolve(process.env.PAGES_ROOT || path.join(PORTAL, '..'))

const JOBS = [
  { src: path.join(ROOT, 'listen_pages'), dest: path.join(PORTAL, 'public/study/listen'), kind: 'listen' },
  { src: path.join(ROOT, 'vocab_pages'), dest: path.join(PORTAL, 'public/study/vocab'), kind: 'vocab' },
  { src: path.join(ROOT, '汇总站_20261008/pages'), dest: path.join(PORTAL, 'public/study/master'), kind: 'master' },
]
const sha1 = (buf) => crypto.createHash('sha1').update(buf).digest('hex')

const backHTML = (href) => `<a href="${href}" target="_self" style="position:fixed;left:14px;bottom:14px;z-index:9999;` +
  `font:600 13px/1 -apple-system,system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.55);` +
  `padding:8px 12px;border-radius:20px;text-decoration:none;box-shadow:0 2px 8px rgba(0,0,0,.25)">← 返回索引</a>`

// 旧成品不删而是搬走：改名/删篇后 public/study 里留下的孤儿会被 VitePress 拷进 dist，
// 但不在 git 里又追不回，所以搬到 public 之外的 .stale_pages/（不进 dist，可手工还原）
const STALE = path.join(PORTAL, '.stale_pages')
function quarantine (dest, kind, f) {
  let to = path.join(STALE, kind, f), n = 1
  while (fs.existsSync(to)) to = path.join(STALE, kind, `${f}.${n++}`)
  fs.mkdirSync(path.dirname(to), { recursive: true })
  fs.renameSync(path.join(dest, f), to)
  return to
}

let copied = 0, stale = 0
const manifest = {}
for (const { src, dest, kind } of JOBS) {
  fs.mkdirSync(dest, { recursive: true })
  for (const f of fs.readdirSync(src)) {
    if (!f.endsWith('.html')) continue
    const rawBuf = fs.readFileSync(path.join(src, f))
    let html = rawBuf.toString('utf8')
    if (kind === 'listen') {
      html = html.split('"../../listen/"').join('"../../listen.html"')
    } else if (kind === 'master') {
      // 总集页的返回入口（2026-10-09 取消 /master 站根页后）：
      // 三张总集页只从 /vocab 与 /listen 顶部横幅进入，回去也回各自的索引页
      if (f.startsWith('词汇')) {
        const BACK = backHTML('../../vocab.html')
        if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, BACK + '</body>')
        else html += BACK
      } else {
        html = html.split('"../../listen/"').join('"../../listen.html"')
      }
    } else {
      // 词汇页：在 </body> 前插入返回浮标（若无 </body> 则追加）
      const BACK = backHTML('../../vocab.html')
      if (/<\/body>/i.test(html)) html = html.replace(/<\/body>/i, BACK + '</body>')
      else html += BACK
    }
    const destAbs = path.join(dest, f)
    fs.writeFileSync(destAbs, html)
    // dest 键相对门户（它就是仓内路径），src 值相对 PAGES_ROOT（它是仓外源页，换机器靠这个推导）
    manifest[path.relative(PORTAL, destAbs).split(path.sep).join('/')] =
      { src: path.relative(ROOT, path.join(src, f)).split(path.sep).join('/'), sha1: sha1(rawBuf) }
    copied++
  }
  // 孤儿清理：dest 里源目录已不存在的 .html（编号重排后旧名会留在这）
  const keep = new Set(fs.readdirSync(src).filter((f) => f.endsWith('.html')))
  for (const f of fs.readdirSync(dest)) {
    if (!f.endsWith('.html') || keep.has(f)) continue
    quarantine(dest, kind, f)
    stale++
    console.log('  旧页搬走', kind + '/' + f)
  }
}
const MF = path.join(PORTAL, '.sync-manifest.json')
fs.writeFileSync(MF, JSON.stringify({
  format: 2,
  note: '由 scripts/sync-pages.mjs 生成，别手改。dest 键相对门户仓，src 相对 PAGES_ROOT（工作区根）。',
  roots: JOBS.map((j) => path.relative(ROOT, j.src).split(path.sep).join('/')),
  files: manifest,
}, null, 1) + '\n')
console.log(`复制 ${copied} 个页面到 public/study/{listen,vocab,master}；孤儿旧页搬走 ${stale} 个；源页指纹写入 .sync-manifest.json（${Object.keys(manifest).length} 条）`)

// 校验：全部页面里的 href/src 若指向本地资源，必须能落到真页面。
// 注意 public/ 只是站点根的物理镜像：站根页（/vocab /listen /papers /）
// 盘上并不存在，而是仓库根的 x.md 编译成 dist/x.html，所以这类相对链接要回退到 md 判定。
const PUB = path.join(PORTAL, 'public')
function linkOk (u, dir) {
  const p = path.resolve(dir, u)
  if (fs.existsSync(p)) return true
  const rel = path.relative(PUB, p)
  if (!rel.startsWith('..')) {
    const name = path.basename(p).replace(/\.html$/, '')
    if (fs.existsSync(path.join(PORTAL, name + '.md'))) return true
  }
  return false
}

let broken = 0
const scanDirs = [path.join(PORTAL, 'public/study/listen'), path.join(PORTAL, 'public/study/vocab'), path.join(PORTAL, 'public/study/master')]
for (const d of scanDirs) {
  for (const f of fs.readdirSync(d)) {
    const html = fs.readFileSync(path.join(d, f), 'utf8')
    for (const m of html.matchAll(/(?:href|src)="(?!https?:|data:|mailto:|#|javascript:)([^"]+)"/g)) {
      const u = m[1]
      if (u.startsWith('/')) continue // 站内绝对路由（如 /study/）交给 VitePress，不在文件系统校验
      const resolved = path.resolve(d, u)
      if (!linkOk(u, d)) { console.log('  失效链接', f, '→', u, '(解析到 ' + path.relative(PORTAL, resolved) + ')'); broken++ }
    }
  }
}
console.log(broken ? `✗ 相对链接失效 ${broken} 处` : '✓ 相对链接 0 失效')
process.exit(broken ? 1 : 0)
