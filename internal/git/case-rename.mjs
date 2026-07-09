import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const [, , from, to] = process.argv

if (!from || !to) {
  process.stderr.write('Usage: pnpm -s git:case-rename -- <from> <to>\n')
  process.exit(2)
}

const tmpBase = `${path.basename(to)}.__tmp_case_${Date.now()}__`
const tmp = path.posix.join(path.posix.dirname(to), tmpBase)

if (fs.existsSync(tmp)) {
  process.stderr.write(`Temp path already exists: ${tmp}\n`)
  process.exit(1)
}

execFileSync('git', ['mv', '-f', from, tmp], { stdio: 'inherit' })
execFileSync('git', ['mv', '-f', tmp, to], { stdio: 'inherit' })
