import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

function gitLsFiles() {
  const out = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  return out.split('\0').filter(Boolean)
}

function getDiskCasePath(relPath) {
  const parts = relPath.split('/').filter(Boolean)
  let curFs = process.cwd()
  const actualParts = []

  for (const seg of parts) {
    if (!fs.existsSync(curFs) || !fs.statSync(curFs).isDirectory()) return null
    const entries = fs.readdirSync(curFs)
    if (entries.includes(seg)) {
      actualParts.push(seg)
      curFs = path.join(curFs, seg)
      continue
    }
    const segLower = seg.toLowerCase()
    const alt = entries.find(e => e.toLowerCase() === segLower)
    if (!alt) return null
    actualParts.push(alt)
    curFs = path.join(curFs, alt)
  }

  return actualParts.join('/')
}

const files = gitLsFiles()

const caseCollisions = new Map()
for (const f of files) {
  const key = f.toLowerCase()
  const arr = caseCollisions.get(key)
  if (arr) arr.push(f)
  else caseCollisions.set(key, [f])
}

const collisions = [...caseCollisions.values()].filter(v => v.length > 1)

const upperInSrc = files.filter(f => f.startsWith('src/') && /[A-Z]/.test(f))

const diskCaseMismatches = []
for (const f of files) {
  const disk = getDiskCasePath(f)
  if (disk && disk !== f) diskCaseMismatches.push({ git: f, disk })
}

if (collisions.length || upperInSrc.length || diskCaseMismatches.length) {
  const lines = []
  if (collisions.length) {
    lines.push('❌存在仅大小写不同的路径冲突（Linux 上会冲突）：')
    for (const group of collisions) lines.push(`- ${group.join(' | ')}`)
  }
  if (upperInSrc.length) {
    lines.push('❌src/ 下存在大写字母路径（建议统一 kebab-case 小写）：')
    for (const f of upperInSrc) lines.push(`- ${f}`)
  }
  if (diskCaseMismatches.length) {
    lines.push('❌Git 索引路径与磁盘实际大小写不一致：')
    for (const { git, disk } of diskCaseMismatches) lines.push(`- ${git} -> ${disk}`)
  }
  process.stderr.write(`${lines.join('\n')}\n`)
  process.exit(1)
}

process.stdout.write('✅path case check ok\n')
