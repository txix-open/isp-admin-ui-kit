import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

if (!process.argv[2]) throw new Error('Pass the offline layout.html fixture')
function run(...args) {
  const result = spawnSync(
    'agent-browser',
    ['--session', 'isp-header-test', ...args],
    { encoding: 'utf8' }
  )
  if (result.status !== 0) throw new Error(result.stdout + result.stderr)
  return result.stdout
}
function evaluate(code) {
  return JSON.parse(run('--json', 'eval', code)).data.result
}
const metrics = `Array.from(document.querySelectorAll('.page-header')).filter(header=>header.getBoundingClientRect().height>0).map(header=>{const style=getComputedStyle(header);const title=getComputedStyle(header.querySelector('.page-header__title'));return {padding:style.padding,color:style.color,background:style.backgroundColor,border:style.borderBottomWidth,font:title.fontFamily,size:title.fontSize,weight:title.fontWeight,line:title.lineHeight,gap:getComputedStyle(header.querySelector('.page-header__inner')).gap}})`
const paths = [
  '/',
  '/modules',
  '/modules/1/connections',
  '/modules/1/configurations/7/all_versions',
  '/app_access',
  '/app_access/101',
  '/users',
  '/users/new',
  '/roles/1',
  '/variables',
  '/variables/APP_TIMEOUT',
  '/application_groups/1/application/101',
  '/sessions',
  '/security_logs',
  '/modules/relations',
  '/header-preview/profile',
  '/header-preview/git',
  '/header-preview/configuration'
]
let passed = 0
try {
  run('--allow-file-access', 'open', pathToFileURL(process.argv[2]).href)
  for (const width of [2560, 375]) {
    let baseline
    run('set', 'viewport', String(width), width === 375 ? '812' : '1440')
    for (const path of paths) {
      run('mouse', 'move', String(width - 20), '790')
      evaluate(`window.layoutTest.show('${path}')`)
      run('wait', '.page-header')
      const headers = evaluate(metrics)
      assert.ok(headers.length, path)
      assert.equal(evaluate('window.layoutTest.check().passed'), true, path)
      baseline ??= headers[0]
      for (const header of headers) {
        assert.equal(header.padding, '12px 16px', path)
        assert.equal(header.size, '22px', path)
        assert.equal(header.gap, '12px', path)
        assert.deepEqual(header, baseline, path)
      }
      console.log(`PASS ${width}px shared header: ${path}`)
      passed++
    }
  }
  for (const state of [{ isLoading: true }, { isError: true }]) {
    evaluate(
      `window.layoutFixtures.queryStates.map=${JSON.stringify(state)};window.layoutTest.show('/modules/relations')`
    )
    run('wait', '.page-header')
    assert.equal(
      evaluate(`document.querySelector('h1').textContent`),
      'Карта связей модулей'
    )
    assert.equal(evaluate('window.layoutTest.check().passed'), true)
    passed++
  }
  console.log(`${passed} checks passed; offline fixtures only`)
} finally {
  run('close')
}
