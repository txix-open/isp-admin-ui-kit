import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

if (!process.argv[2]) throw new Error('Pass the offline layout.html path')
function run(...args) {
  const result = spawnSync(
    'agent-browser',
    ['--session', 'isp-variable-list', ...args],
    { encoding: 'utf8' }
  )
  if (result.status !== 0) throw new Error(result.stdout + result.stderr)
  return result.stdout
}
function evaluate(code) {
  return JSON.parse(run('--json', 'eval', code)).data.result
}
function waitFor(code) {
  for (let i = 0; i < 40; i++) {
    if (evaluate(code)) return
    run('wait', '100')
  }
  throw new Error(`Timed out: ${code}`)
}
function show(path = '/variables', width = 1440) {
  run('set', 'viewport', String(width), width < 768 ? '812' : '1440')
  run('mouse', 'move', String(width - 20), width < 768 ? '792' : '1420')
  evaluate(`window.layoutTest.show(${JSON.stringify(path)})`)
  run('wait', '.variables-page, .ant-result-403')
}
const search = `document.querySelector('[data-testid="test-route"]').dataset.search`
const route = `document.querySelector('[data-testid="test-route"]').textContent`
let passed = 0
function check(name, test) {
  test()
  console.log(`PASS ${name}`)
  passed++
}
try {
  run('--allow-file-access', 'open', pathToFileURL(process.argv[2]).href)
  for (const width of [2560, 375])
    check(`layout and local scrolling at ${width}px`, () => {
      show('/variables', width)
      assert.equal(evaluate('window.layoutTest.check().passed'), true)
      assert.equal(evaluate('document.querySelectorAll("h1").length'), 1)
    })
  check('pagination is stored in the URL', () => {
    show()
    run('click', '.ant-pagination-next button')
    waitFor(`new URLSearchParams(${search}).get('page') === '2'`)
    assert.equal(
      evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      17
    )
  })
  check('column filter resets the page and persists in the URL', () => {
    run('click', 'th:has-text("Наименование") .ant-table-filter-trigger')
    run('fill', 'input[aria-label="Значение фильтра"]', 'APP_TIMEOUT')
    run('click', 'button:has-text("Найти")')
    waitFor(`new URLSearchParams(${search}).get('name') === 'APP_TIMEOUT'`)
    assert.equal(evaluate(`new URLSearchParams(${search}).has('page')`), false)
    assert.equal(
      evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      1
    )
  })
  check('editor return keeps the table state', () => {
    show('/variables?name=APP_TIMEOUT&sort=name&order=descend')
    run('click', 'a:has-text("APP_TIMEOUT")')
    waitFor(`${route} === '/variables/APP_TIMEOUT'`)
    run('click', 'button:has-text("К переменным")')
    waitFor(`${route} === '/variables'`)
    assert.equal(evaluate(search), '?name=APP_TIMEOUT&sort=name&order=descend')
    assert.equal(
      evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      1
    )
  })
  check('column sorting is stored in the URL and applied to rows', () => {
    show()
    run('click', 'th:has-text("Наименование") .ant-table-column-sorters')
    waitFor(`new URLSearchParams(${search}).get('sort') === 'name'`)
    assert.equal(
      evaluate(`new URLSearchParams(${search}).get('order')`),
      'ascend'
    )
    assert.equal(
      evaluate(
        `document.querySelector('.ant-table-tbody tr[data-row-key]').dataset.rowKey`
      ),
      'API_KEY'
    )
  })
  check('empty search can reset only table parameters', () => {
    show('/variables?name=MISSING&sort=name&order=ascend&page=99&external=keep')
    assert.equal(
      evaluate(
        `document.body.textContent.includes('По заданным условиям переменные не найдены')`
      ),
      true
    )
    run('click', '[data-testid="variables-table__clear-all-btn"]')
    waitFor(`${search} === '?external=keep'`)
  })
  check('view-only users can open a variable', () => {
    evaluate(`window.layoutFixtures.grantedPermissions=['variable_view']`)
    show('/variables?name=APP_TIMEOUT')
    assert.equal(
      evaluate(
        `document.querySelectorAll('[data-testid="variables-table__edit-config-btn"], [data-testid="variables-table__delete-config-btn"]').length`
      ),
      0
    )
    run('click', 'a:has-text("APP_TIMEOUT")')
    waitFor(`${route} === '/variables/APP_TIMEOUT'`)
    assert.equal(
      evaluate(
        `document.querySelector('[data-testid="variable-editor-header__save-btn"]')`
      ),
      null
    )
  })
  check(
    'delete permission is independent of edit permission; used variables stay protected',
    () => {
      evaluate(
        `window.layoutFixtures.grantedPermissions=['variable_view','variable_delete'];window.layoutFixtures.variables.APP_TIMEOUT.containsInConfigs=[{id:'config',moduleId:1,name:'Конфигурация'}]`
      )
      show('/variables?name=APP_TIMEOUT')
      assert.equal(
        evaluate(
          `document.querySelector('[data-testid="variables-table__delete-config-btn"]').disabled`
        ),
        true
      )
      assert.equal(
        evaluate(
          `document.querySelector('[data-testid="variables-table__edit-config-btn"]')`
        ),
        null
      )
      evaluate(
        'window.layoutFixtures.variables.APP_TIMEOUT.containsInConfigs=[]'
      )
      show('/variables?name=APP_TIMEOUT')
      assert.equal(
        evaluate(
          `document.querySelector('[data-testid="variables-table__delete-config-btn"]').disabled`
        ),
        false
      )
      evaluate('delete window.layoutFixtures.grantedPermissions')
    }
  )
  check('pending deletion prevents repeated row actions', () => {
    evaluate(`window.layoutFixtures.removingName='VAR_0'`)
    show()
    assert.equal(
      evaluate(
        `document.querySelector('[aria-label="Удалить переменную VAR_0"]').classList.contains('ant-btn-loading')`
      ),
      true
    )
    assert.equal(
      evaluate(
        `document.querySelector('[aria-label="Удалить переменную VAR_1"]').disabled`
      ),
      true
    )
    evaluate('delete window.layoutFixtures.removingName')
  })
  check('load error stays on the page with retry', () => {
    evaluate(
      'window.layoutFixtures.queryStates.variables={isError:true,data:undefined}'
    )
    show()
    assert.equal(evaluate(`!!document.querySelector('.ant-alert-error')`), true)
    assert.equal(evaluate(route), '/variables')
    run('click', 'button:has-text("Повторить")')
    assert.equal(evaluate('window.layoutFixtures.retried'), 'variables')
  })
  check('loading keeps the page heading and shows a data indicator', () => {
    evaluate(
      'window.layoutFixtures.queryStates.variables={isFetching:true,data:undefined}'
    )
    show()
    assert.equal(
      evaluate(`document.querySelector('h1').textContent`),
      'Переменные'
    )
    assert.equal(
      evaluate(`!!document.querySelector('.ant-spin-spinning')`),
      true
    )
  })
  check('an empty collection is distinguished from a load error', () => {
    evaluate('window.layoutFixtures.queryStates.variables={data:[]}')
    show()
    assert.equal(
      evaluate(`document.body.textContent.includes('Переменных пока нет')`),
      true
    )
    assert.equal(evaluate(`document.querySelector('.ant-alert-error')`), null)
  })
  check('refresh error retains cached rows', () => {
    evaluate('window.layoutFixtures.queryStates.variables={isError:true}')
    show()
    assert.equal(
      evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      50
    )
    evaluate('window.layoutFixtures.queryStates.variables={}')
  })
  check('denied access skips the query', () => {
    evaluate('window.layoutFixtures.grantedPermissions=[]')
    show()
    assert.equal(
      evaluate(
        `window.layoutFixtures.queryCalls.filter(call=>call.service==='variables').at(-1).skip`
      ),
      true
    )
  })
  console.log(
    `${passed} checks passed; mutations disabled, CSP connect-src none`
  )
} catch (error) {
  console.log(
    evaluate(
      `(() => { const link=document.querySelector('a[href*="APP_TIMEOUT"]'); const rect=link?.getBoundingClientRect(); return {link:link?.outerHTML,rect:rect?.toJSON(),hit:rect ? document.elementFromPoint(rect.x+rect.width/2,rect.y+rect.height/2)?.outerHTML : null,overlays:[...document.querySelectorAll('.ant-dropdown')].map(e=>({class:e.className,rect:e.getBoundingClientRect().toJSON()}))}; })()`
    )
  )
  throw error
} finally {
  run('close')
}
