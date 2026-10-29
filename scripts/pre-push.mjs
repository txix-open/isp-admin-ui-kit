import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const windows = process.platform === 'win32'
const npm = windows ? 'npm.cmd' : 'npm'
const checks = [
  ['test', 210_000],
  ['build', 120_000],
  ['build-storybook', 120_000]
]

function runCheck(name, timeout) {
  return new Promise((resolve) => {
    const child = spawn(npm, ['run', name], {
      cwd: root,
      stdio: ['ignore', 'inherit', 'inherit'],
      detached: !windows
    })
    let timedOut = false
    let forceKill
    const terminate = (signal) => {
      if (!child.pid) return
      if (windows) {
        spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], {
          stdio: 'ignore',
          timeout: 5_000
        })
      } else {
        try {
          process.kill(-child.pid, signal)
        } catch (error) {
          if (error.code !== 'ESRCH') console.error(error.message)
        }
      }
    }
    const cancel = () => {
      timedOut = true
      terminate('SIGKILL')
    }
    process.once('SIGINT', cancel)
    process.once('SIGTERM', cancel)
    const timer = setTimeout(() => {
      timedOut = true
      console.error(
        `${name} exceeded ${timeout / 1000}s; stopping its process group`
      )
      terminate('SIGTERM')
      // Keep the timer alive even if npm exits before its descendants.
      forceKill = setTimeout(() => terminate('SIGKILL'), 5_000)
    }, timeout)
    const finish = (passed) => {
      clearTimeout(timer)
      if (!timedOut) clearTimeout(forceKill)
      process.removeListener('SIGINT', cancel)
      process.removeListener('SIGTERM', cancel)
      resolve(passed && !timedOut)
    }
    child.once('error', (error) => {
      console.error(error.message)
      finish(false)
    })
    child.once('exit', (code) => finish(code === 0))
  })
}

console.log('Running UI kit pre-push checks')
let passed = true
for (const [name, timeout] of checks) {
  console.log(`\nRunning ${name}...`)
  if (!(await runCheck(name, timeout))) {
    console.error(`${name} failed. Push aborted.`)
    passed = false
    break
  }
}
if (passed) console.log('All UI kit checks passed')
process.exitCode = passed ? 0 : 1
