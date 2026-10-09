#!/usr/bin/env node
// 断链实验：证明「这个仓库自己就能把站点内容重建出来」，不靠工作区里任何兄弟目录。
// 做法：把仓库单独拷进临时目录（旁边没有 vocab_pages/门户文稿/workdir 这些东西），
//       在那里面跑整套内容校验 + 两个内容生成器的 --check。
//       在原地跑不算是证明——仓外的路径在原地照样解析得到，只有孤立副本才骗不了人。
// 跑法：npm run selfcheck
// 注：不在这里做 npm run build（要 node_modules，几百 MB 拷进拷出太慢）；
//     构建侧的自足性由 CI 的干净 runner 证明（deploy.yml 只有仓库里的东西）。
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL = path.resolve(__dirname, '..')
// 这些目录要么可再生、要么与本证明无关（previews/.stale_pages 也已 gitignore）
const SKIP = new Set(['node_modules', '.git', 'previews', '.stale_pages'])
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'portal-selfcheck-'))
const DST = path.join(TMP, 'portal')

fs.cpSync(PORTAL, DST, {
  recursive: true,
  filter: (src) => !SKIP.has(path.relative(PORTAL, src).split(path.sep)[0]),
})

const size = execFileSync('du', ['-sh', DST], { encoding: 'utf8' }).trim().split('\t')[0]
console.log(`孤立副本：${DST}（${size}，旁边没有任何工作区目录）`)

let bad = 0
const step = (name, cmd, args) => {
  try {
    const out = execFileSync(cmd, args, { cwd: DST, encoding: 'utf8' }).trim()
    console.log(`✓ ${name}  — ` + out.split('\n').pop().replace(/^✓ */, ''))
  } catch (e) {
    bad++
    const msg = ((e.stdout || '') + (e.stderr || '') + (e.message || '')).trim()
    console.log(`✗ ${name}\n${msg.split('\n').slice(0, 4).map(l => '    ' + l).join('\n')}`)
  }
}

step('gen-data --check（json ← 仓内词汇页）', 'python3', ['scripts/gen-data.py', '--check'])
step('refresh-papers --check（papers.md ← 仓内文稿）', process.execPath, ['scripts/refresh-papers.mjs', '--check'])
step('verify_content（全量守卫，含再跑一遍上面两项）', process.execPath, ['scripts/verify_content.mjs'])

fs.rmSync(TMP, { recursive: true, force: true })
console.log(bad
  ? `\n==== 断链实验失败 ${bad} 处：仓外依赖没断干净 ====`
  : '\n==== 断链实验通过：内容层只靠仓库自身就能完整重建 ====')
process.exit(bad ? 1 : 0)
