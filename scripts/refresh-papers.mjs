#!/usr/bin/env node
// 论文总览页刷新：仓内文稿母本 content/DeepSeek_论文列表.md → papers.md（加 frontmatter+导流头）→ 可选重建。
// 用法：node scripts/refresh-papers.mjs            # 只重新生成 papers.md
//       node scripts/refresh-papers.mjs --build   # 生成后顺带 npm run build
//       node scripts/refresh-papers.mjs --check   # 只对账（papers.md 是不是文稿的当前产物），不写盘
import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL = path.resolve(__dirname, '..')

// 2026-10-09 定案：文稿就是仓库自己的源码（不再是工作区里另一个目录）。
// 本站是一个独立代码仓 + 静态站点，要能仅从仓内重建，所以默认读仓内母本；
// PAPERS_SRC 只用于“临时拿另一份文稿试效果”，不是日常入口。
// 找不到就报错退出，**绝不回退到别处的旧副本**（那会静默用错源文稿，比报错更坏）
const SRC = process.env.PAPERS_SRC
  ? path.resolve(process.env.PAPERS_SRC)
  : path.join(PORTAL, 'content', 'DeepSeek_论文列表.md')
if (!fs.existsSync(SRC)) {
  console.error(`✗ 找不到文稿母本：${SRC}\n  它就在仓库里（content/DeepSeek_论文列表.md）——被删了则 git checkout 取回；` +
    `临时换一份用 PAPERS_SRC=/path/to/x.md`)
  process.exit(1)
}

// 建页篇数跟 papers.json 走（加篇/重排编号后不必改这里的文案）
const np = JSON.parse(fs.readFileSync(path.join(PORTAL, 'data/papers.json'), 'utf8')).length

const HEAD = `---
pageClass: wide papers
title: 论文总览
---

# 📚 DeepSeek 论文总览

DeepSeek 全系列论文的时间线、分主线清单与解读资源汇总。本站已为其中 ${np} 篇制作了词汇学习页：→ [词汇学习](/vocab) · [词汇朗读](/listen)

`

const body = fs.readFileSync(SRC, 'utf8')
const out = path.join(PORTAL, 'papers.md')
const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : ''

// --check：pre-push 钩子与自检用它拦「改了文稿忘渲染就 push」（跟 gen-data --check 同一套路）
if (process.argv.includes('--check')) {
  if (before !== HEAD + body) {
    console.error(`✗ papers.md 与文稿母本 content/DeepSeek_论文列表.md 不同步（改了文稿忘渲染）` +
      `\n  跑一句 npm run papers 重新生成，再把 papers.md 一起提交`)
    process.exit(1)
  }
  console.log(`✓ refresh-papers --check：papers.md 与仓内文稿一致（${body.split('\n').length} 行正文）`)
  process.exit(0)
}

fs.writeFileSync(out, HEAD + body)

// 报告变化规模（按正文行数粗算，忽略头部）
const strip = s => s.split('\n').slice(HEAD.trimEnd().split('\n').length).join('\n')
const changed = before ? (strip(before) === strip(body) ? 0 : Math.abs(body.split('\n').length - strip(before).split('\n').length)) : -1
console.log(`✓ papers.md 已刷新（源：${SRC}）`)
console.log(changed === -1 ? '  首次生成' : changed === 0 ? '  内容无变化' : `  正文约变动 ${changed} 行`)

if (process.argv.includes('--build')) {
  execSync('npm run build', { cwd: PORTAL, stdio: 'inherit' })
  console.log('✓ 站点已重建（.vitepress/dist）')
}
