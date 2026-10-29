import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const fixture = process.argv[2]
const rolesOnly = process.argv.includes('--roles-only')
if (!fixture) throw new Error('Pass the offline layout.html path')
function run(...args) {
  const result = spawnSync(
    'agent-browser',
    ['--session', 'isp-pages-test', ...args],
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
function waitForDrawer() {
  waitFor(`(() => {
    const panel = document.querySelector('.ant-drawer-open .ant-drawer-content-wrapper');
    if (!panel) return false;
    const rect = panel.getBoundingClientRect();
    return Math.abs(rect.right - innerWidth) < 1 && Math.abs(rect.width - Math.min(960, innerWidth)) < 1;
  })()`)
}
function show(path, width = 2560, dark = false) {
  run('set', 'viewport', String(width), width < 768 ? '812' : '1440')
  evaluate(`window.layoutTest.show(${JSON.stringify(path)}, ${dark})`)
  waitFor(
    `document.querySelector('[data-testid="test-route"]').textContent === ${JSON.stringify(path.split('?')[0])}`
  )
}
let passed = 0
function check(title, test) {
  test()
  console.log(`PASS ${title}`)
  passed++
}
const route = `document.querySelector('[data-testid="test-route"]').textContent`
try {
  run('--allow-file-access', 'open', pathToFileURL(fixture).href)
  if (!rolesOnly)
    for (const width of [2560, 375]) {
      for (const path of [
        '/sessions',
        '/security_logs',
        '/roles/new',
        '/roles/1',
        '/users',
        '/users/new',
        '/variables/APP_TIMEOUT'
      ]) {
        check(`${path} at ${width}px`, () => {
          show(path, width)
          assert.equal(evaluate('window.layoutTest.check().passed'), true)
          assert.equal(evaluate(`document.querySelectorAll('h1').length`), 1)
        })
      }
    }
  check('new role is a draft with clear actions and focus', () => {
    show('/roles/1?search=Оператор')
    run('fill', '.roles-page input[name="name"]', 'Несохранённое название')
    evaluate(
      `document.querySelector('.roles-page .roles-content').dataset.draftProbe='kept'`
    )
    run('click', 'button:has-text("Новая роль")')
    waitFor(`!!document.querySelector('.ant-drawer-open')`)
    assert.equal(evaluate(route), '/roles/1')
    assert.equal(
      evaluate(
        `document.querySelector('.roles-page input[name="name"]').value`
      ),
      'Несохранённое название'
    )
    assert.equal(
      evaluate(
        `document.querySelector('.roles-page .roles-content').dataset.draftProbe`
      ),
      'kept'
    )
    assert.equal(evaluate(`document.activeElement.textContent`), 'Новая роль')
    assert.equal(
      evaluate(`document.body.textContent.includes('Роль ещё не создана')`),
      true
    )
    assert.equal(
      evaluate(
        `document.querySelector('.ant-drawer [data-cy="roles-content__header__save-button"]').disabled`
      ),
      true
    )
    assert.equal(evaluate('window.layoutFixtures.roles.length'), 1)
    run('fill', '.ant-drawer input[name="name"]', 'Новая тестовая роль')
    run('click', 'button:has-text("Создать роль")')
    waitFor(`document.querySelector('.ant-modal') !== null`)
    assert.equal(evaluate('window.layoutFixtures.roles.length'), 1)
    run('click', '.ant-modal button:has-text("Отмена")')
    run('click', 'button:has-text("Отменить создание")')
    waitFor(`!document.querySelector('.ant-drawer-open')`)
    assert.equal(evaluate(route), '/roles/1')
    assert.equal(
      evaluate(
        `document.querySelector('.roles-page input[name="name"]').value`
      ),
      'Несохранённое название'
    )
    assert.equal(
      evaluate(
        `new URLSearchParams(document.querySelector('[data-testid="test-route"]').dataset.search).get('search')`
      ),
      'Оператор'
    )
  })
  check('browser back closes creation and preserves the viewed role', () => {
    run('click', 'button:has-text("Новая роль")')
    waitFor(`!!document.querySelector('.ant-drawer-open')`)
    evaluate('window.navigateInFixture(-1)')
    waitFor(`!document.querySelector('.ant-drawer-open')`)
    assert.equal(evaluate(route), '/roles/1')
    assert.equal(
      evaluate(
        `document.querySelector('.roles-page input[name="name"]').value`
      ),
      'Несохранённое название'
    )
  })
  for (const width of [2560, 375])
    check(`direct creation drawer at ${width}px`, () => {
      show('/roles/new', width)
      waitForDrawer()
      assert.equal(evaluate('window.layoutTest.check().passed'), true)
      assert.equal(
        evaluate(
          `document.querySelector('.ant-drawer-content-wrapper').getBoundingClientRect().width <= innerWidth`
        ),
        true
      )
      assert.equal(
        evaluate(`(() => {
        const fields = [...document.querySelectorAll('.ant-drawer input, .ant-drawer .page-header__actions button')];
        return fields.every(field => { const box = field.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth + 1; });
      })()`),
        true
      )
      assert.equal(
        evaluate(
          `document.querySelector('.ant-drawer input[name="name"]').value`
        ),
        ''
      )
      run('click', 'button:has-text("Отменить создание")')
      waitFor(`${route} === '/roles'`)
    })
  check(
    'creation uses add permission while the viewed role remains read-only',
    () => {
      evaluate(
        `window.layoutFixtures.grantedPermissions=['role_view','role_add']`
      )
      show('/roles/1')
      assert.equal(
        evaluate(
          `document.querySelector('.roles-page input[name="name"]').disabled`
        ),
        true
      )
      run('click', 'button:has-text("Новая роль")')
      waitFor(`!!document.querySelector('.ant-drawer-open')`)
      run('fill', '.ant-drawer input[name="name"]', 'Роль оператора')
      assert.equal(
        evaluate(
          `document.querySelector('.ant-drawer [data-cy="roles-content__header__save-button"]').disabled`
        ),
        false
      )
      run('click', 'button:has-text("Отменить создание")')
      evaluate('delete window.layoutFixtures.grantedPermissions')
    }
  )
  if (!rolesOnly)
    for (const [path, service] of [
      ['/sessions', 'sessions'],
      ['/security_logs', 'logs']
    ]) {
      check(`${service}: URL pagination and unknown user fallback`, () => {
        show(`${path}?page=2`)
        assert.equal(
          evaluate(
            `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).args.offset`
          ),
          10
        )
        assert.equal(
          evaluate(`document.body.textContent.includes('Пользователь #999')`),
          true
        )
        run('click', '.ant-pagination-next button')
        waitFor(
          `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).args.offset === 20`
        )
      })
      check(`${service}: error and retry replace endless loading`, () => {
        evaluate(
          `window.layoutFixtures.queryStates.${service}={currentData:undefined,data:undefined,isError:true}`
        )
        show(path)
        assert.equal(
          evaluate(`!!document.querySelector('.ant-alert-error')`),
          true
        )
        run('click', 'button:has-text("Повторить")')
        assert.equal(evaluate('window.layoutFixtures.retried'), service)
        evaluate(`window.layoutFixtures.queryStates.${service}={}`)
      })
      check(`${service}: denied access skips the list query`, () => {
        evaluate('window.layoutFixtures.grantedPermissions=[]')
        show(path)
        assert.equal(
          evaluate(`!!document.querySelector('.ant-result-403')`),
          true
        )
        assert.equal(
          evaluate(
            `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).skip`
          ),
          true
        )
        evaluate('delete window.layoutFixtures.grantedPermissions')
      })
    }
  if (!rolesOnly)
    check('dark theme uses the same layout', () => {
      show('/security_logs', 1440, true)
      assert.equal(evaluate('window.layoutTest.check().passed'), true)
    })
  console.log(
    `${passed} checks passed; mutations disabled, CSP connect-src none`
  )
} finally {
  run('close')
}
