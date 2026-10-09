// 为 data/papers.json 里的每一篇补一个空白学习笔记：notes/<编号>_<论文短名>.md
//
// 铁律：**只补缺，绝不覆盖已有文件**。笔记正文是用户手写的，任何重生成都不能碰它，
// 所以这里没有 --force，也没有任何「重写模板」的分支。
//
// 跑法：
//   npm run notes                       补缺失的（一篇都不缺时只报一行）
//   node scripts/gen-notes.mjs --check  只检查：缺 / 多 / 命名不符 → 退出码 1，不写盘
//
// 也可以被 import（脚本主体有 main 守卫）：verify_content.mjs 复用同一个判空口径。
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const PORTAL = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const NOTES = path.join(PORTAL, 'notes')

// 正文判空口径（与 components/PaperIndex.vue 里的「未写」标记必须一致）：
// 去掉开头的 frontmatter 块之后，剩下的东西 trim 完是空 ＝ 还没写。
export const stripFront = (s) => s.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')

const tpl = (p) => [
  '---',
  '# 正文写在这条线以下：标题、表格、代码块、图片都支持，写什么就渲染什么。',
  '# 空着时笔记页只显示一行轻提示。文件名对应 data/papers.json，要改名请连索引一起跑 npm run notes。',
  '# （这段注释不渲染到页面上：站点是给读者看的，写笔记的操作说明只放这里与 README「维护：改哪里」。）',
  `title: ${p.num} · ${p.short} 学习笔记`,
  'pageClass: note-page',
  '---',
  '',
].join('\n')

export function main (check = process.argv.includes('--check')) {
  const papers = JSON.parse(fs.readFileSync(path.join(PORTAL, 'data/papers.json'), 'utf8'))
  const want = papers.map((p) => p.dir + '.md')
  const have = fs.existsSync(NOTES) ? fs.readdirSync(NOTES).filter((f) => f.endsWith('.md')) : []
  const missing = want.filter((f) => !have.includes(f))
  const extra = have.filter((f) => !want.includes(f))
  const written = have.filter((f) => stripFront(fs.readFileSync(path.join(NOTES, f), 'utf8')).trim())

  if (check) {
    const bad = []
    if (missing.length) bad.push(`缺 ${missing.length} 篇：${missing.slice(0, 4).join(' ')}${missing.length > 4 ? ' …' : ''}`)
    if (extra.length) bad.push(`多出 ${extra.length} 个（论文已删或命名不符）：${extra.slice(0, 4).join(' ')}`)
    if (bad.length) { console.error('✗ 笔记文件与 papers.json 不对平：\n  ' + bad.join('\n  ')); return 1 }
    console.log(`✓ notes/ 下 ${have.length} 篇齐全（已写 ${written.length} 篇 · 空白 ${have.length - written.length} 篇）`)
    return 0
  }

  fs.mkdirSync(NOTES, { recursive: true })
  for (const p of papers) {
    const f = path.join(NOTES, p.dir + '.md')
    if (fs.existsSync(f)) continue
    fs.writeFileSync(f, tpl(p))
    console.log('  新建空白笔记', path.relative(PORTAL, f))
  }
  const now = fs.readdirSync(NOTES).filter((f) => f.endsWith('.md'))
  console.log(`笔记文件 ${now.length} 篇（本次新建 ${missing.length} 篇）· 已写内容 ${written.length} 篇 · 空白 ${now.length - written.length} 篇`)
  if (extra.length) console.log(`⚠ 多出的 ${extra.length} 个不在 papers.json 里，自己确认是留还是删：${extra.join(' ')}`)
  return 0
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exit(main())
}
