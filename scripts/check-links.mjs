// 站外导航链接健康检测：读 sites/sites.json（上墙 + 待选全部），逐个请求，
// 把死链写进 sites/dead-links.json，供 SiteNavWall.vue 渲染「404」角标。
// 跑法：npm run links                       （本地预跑，写 dead-links.local.json）
//       GitHub Actions 每周一自动跑（.github/workflows/link-check.yml，写 dead-links.json）
// ⚠ 两个输出文件是故意分开的：本地网络在墙内，跑出来的 unreachable 大量是假阳性，
//    写进 local 文件（已进 .gitignore）就从根上防了误提交；跟仓走的那份只可能是 Actions 的真结果。
// 判档口径（status 字段）：
//   ok          2xx/3xx 正常
//   dead        404 / 410 —— 确定性坏链
//   unreachable DNS 解析失败 / 连接被拒 / 超时 —— 本机/当前网络访问不通（也标角标，
//               因为对用户同样点不开；注意本地跑可能是 GFW 拦截，Actions 上跑才是全球视角）
//   blocked     403 / 405 / 429 / 503 —— 多半是反爬拦截，不是站没了，不标
//   unknown     其他异常状态
// 策略：先 HEAD（省流量），405/403/非 2xx 再用 GET 复核一次，避免把
//        只收 GET 的站误判成死链。
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const data = JSON.parse(readFileSync(path.join(ROOT, 'sites/sites.json'), 'utf8'))
const targets = [...data.sites, ...data.pending]

const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
const TIMEOUT = 20_000
const DEAD_CODES = new Set([404, 410])
const BLOCK_CODES = new Set([403, 405, 429, 503])

async function probe(url, method) {
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), TIMEOUT)
  try {
    const res = await fetch(url, {
      method,
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,*/*' },
    })
    return { kind: 'http', code: res.status }
  } catch (e) {
    // fetch 抛异常：DNS 失败 / 连接被拒 / 超时 / TLS 错误 —— 一律按坏链
    return { kind: 'net', code: 0, err: e.cause?.code || e.name || String(e.message) }
  } finally {
    clearTimeout(t)
  }
}

function classify(r) {
  if (r.kind === 'net') return 'unreachable'
  if (r.code >= 200 && r.code < 400) return 'ok'
  if (DEAD_CODES.has(r.code)) return 'dead'
  if (BLOCK_CODES.has(r.code)) return 'blocked'
  return 'unknown'
}

async function check(site) {
  let r = await probe(site.url, 'HEAD')
  // HEAD 拿到非成功响应时，用 GET 复核（很多站不接 HEAD 或 HEAD 也返 403/405）
  if (classify(r) !== 'ok') {
    const g = await probe(site.url, 'GET')
    if (classify(g) === 'ok' || classify(g) !== classify(r)) r = g
  }
  return {
    slug: site.slug,
    name: site.name,
    url: site.url,
    status: classify(r),
    code: r.code,
    detail: r.err || '',
  }
}

// 并发 6 个，别把对方站打爆，也别让自己等太久
const QUEUE = [...targets]
const results = []
const workers = Array.from({ length: 6 }, async () => {
  while (QUEUE.length) {
    const site = QUEUE.shift()
    const res = await check(site)
    results.push(res)
    const mark = { ok: '✓', dead: '✗', unreachable: '✗', blocked: '▲', unknown: '?' }[res.status]
    console.log(`${mark} [${res.code}] ${res.status.padEnd(7)} ${res.slug} — ${res.name}`)
  }
})
await Promise.all(workers)
results.sort((a, b) => targets.findIndex(t => t.slug === a.slug) - targets.findIndex(t => t.slug === b.slug))

const dead = results.filter(r => r.status === 'dead' || r.status === 'unreachable')
/* 取数来源决定结果可不可信：Actions 的 runner 在美国，拿到的是全球视角；
   本地跑时 Google Scholar / HF / V2EX / Reddit / X / HN / YouTube 这类站在墙外，
   报的 unreachable 是网络拦截而不是站挂了——所以本地结果只能当预跑，
   当真回提上线的那份必须是 ranFrom=github-actions 跑出来的。 */
const ranFrom = process.env.GITHUB_ACTIONS === 'true' ? 'github-actions' : 'local'
// 真结果只由 Actions 写；本地跑另存一份，不进 git（要本地看角标效果就手动拷过去覆盖）
const OUT = ranFrom === 'github-actions' ? 'dead-links.json' : 'dead-links.local.json'
const out = {
  _note: '站外导航死链检测结果，由 scripts/check-links.mjs（npm run links）生成，Actions 每周一自动跑并回提本文件，勿手改。status=dead/unreachable 的站在墙上标「404」角标；blocked 多为反爬拦截，不标。本地跑只会写 dead-links.local.json，不会动本文件。',
  ranFrom,
  checkedAt: new Date().toISOString().slice(0, 10),
  results: results.map(({ status, code, ...rest }) => ({ ...rest, status, code })),
  dead: dead.map(r => r.slug),
}
writeFileSync(path.join(ROOT, 'sites', OUT), JSON.stringify(out, null, 2) + '\n')
console.log(`\n共 ${results.length} 站：坏链 ${dead.length}（404 ${results.filter(r => r.status === 'dead').length} + 不通 ${results.filter(r => r.status === 'unreachable').length}） · 拦截 ${results.filter(r => r.status === 'blocked').length} · 正常 ${results.filter(r => r.status === 'ok').length}`)
console.log('已写入 sites/' + OUT + '（ranFrom=' + ranFrom + '）')
if (ranFrom === 'local') {
  console.log('ℹ 本地结果不进 git（墙外站会被误报成 unreachable）。要看角标效果：cp sites/dead-links.local.json sites/dead-links.json 后起 preview，记得改回来。')
}
