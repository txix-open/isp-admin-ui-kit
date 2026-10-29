import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

if (!process.argv[2]) throw new Error('Pass the offline layout.html fixture')
function run(...args) {
  const result = spawnSync(
    'agent-browser',
    ['--session', 'isp-app-switch', ...args],
    { encoding: 'utf8' }
  )
  if (result.status !== 0) throw new Error(result.stdout + result.stderr)
  return result.stdout
}
function evaluate(code) {
  return JSON.parse(run('--json', 'eval', code)).data.result
}
try {
  run('--allow-file-access', 'open', pathToFileURL(process.argv[2]).href)
  run('set', 'viewport', '2560', '1440')
  run('eval', `window.layoutTest.show('/application_groups/1/application/101')`)
  run('wait', '.token-content')
  for (const id of [102, 103, 102, 101, 104, 101]) {
    run(
      'click',
      `.applications-content__list .ant-list-item-meta-title:text-is("Приложение ${id - 100}")`
    )
    const actual = evaluate(
      `({ headers:document.querySelectorAll('.applications-content__details > .page-header').length, tables:document.querySelectorAll('.token-content .ant-table-wrapper').length, title:document.querySelector('.applications-content__details > .page-header .page-header__title')?.textContent, context:document.querySelector('.applications-content__details > .page-header .page-header__context')?.textContent })`
    )
    assert.equal(actual.headers, 1, `Application ${id}: accumulated headers`)
    assert.equal(actual.tables, 1, `Application ${id}: extra token tables`)
    assert.equal(actual.title, `Приложение ${id - 100}`)
    assert.ok(actual.context.includes(`ID ${id}`))
    console.log(`PASS application ${id}: one matching header and token table`)
  }
} finally {
  run('close')
}
