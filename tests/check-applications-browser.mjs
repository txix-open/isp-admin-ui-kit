import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

if (!process.argv[2]) throw new Error('Pass the offline layout.html fixture')
function run(...args) {
  const result = spawnSync(
    'agent-browser',
    ['--session', 'isp-applications-test', ...args],
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
function show(path, width = 2560) {
  run('set', 'viewport', String(width), width < 768 ? '812' : '1440')
  run('mouse', 'move', String(width - 20), width < 768 ? '790' : '1420')
  evaluate(`window.layoutTest.show(${JSON.stringify(path)})`)
  run('wait', '.applications-screen, .ant-result-403')
}
const route = `document.querySelector('[data-testid="test-route"]').textContent`
const search = `document.querySelector('[data-testid="test-route"]').dataset.search`
const visible = (selector) =>
  evaluate(
    `(() => { const e=document.querySelector(${JSON.stringify(selector)}); return Boolean(e && e.getBoundingClientRect().height); })()`
  )
const submit = '.ant-modal button[type="submit"]'
let passed = 0
function check(name, test) {
  test()
  console.log(`PASS ${name}`)
  passed++
}
try {
  run('--allow-file-access', 'open', pathToFileURL(process.argv[2]).href)
  for (const width of [2560, 375]) {
    for (const path of [
      '/application_groups',
      '/application_groups/1',
      '/application_groups/1/application/101'
    ]) {
      check(`${path} at ${width}px`, () => {
        show(path, width)
        assert.equal(evaluate('window.layoutTest.check().passed'), true)
        if (width === 375) {
          assert.equal(
            visible('.applications-page__groups'),
            path === '/application_groups'
          )
          if (path.includes('/1')) {
            assert.equal(
              visible('.applications-content__list'),
              !path.includes('/application/')
            )
            assert.equal(
              visible('.applications-content__details'),
              path.includes('/application/')
            )
          }
        }
      })
    }
  }
  check('mobile back returns through apps and groups', () => {
    run('click', 'button:has-text("К приложениям")')
    waitFor(`${route} === '/application_groups/1'`)
    run('click', 'button[aria-label="К группам"]')
    waitFor(`${route} === '/application_groups'`)
  })
  check('groups and apps remain visible beside selected app data', () => {
    show('/application_groups/1/application/101')
    assert.equal(visible('.applications-page__groups'), true)
    assert.equal(visible('.applications-content__list'), true)
    assert.equal(visible('.token-content'), true)
    assert.equal(
      evaluate(
        `[...document.querySelectorAll('.applications-page .column')].filter(element=>element.getBoundingClientRect().height>0).length`
      ),
      2
    )
  })
  check('new group preserves the selected app and URL filters', () => {
    show('/application_groups/1/application/101?search=Группа')
    run('click', 'button:has-text("Новая группа")')
    run('wait', '.ant-modal')
    assert.equal(evaluate(route), '/application_groups/1/application/101')
    assert.equal(
      evaluate(`document.querySelector('.ant-modal input[name="name"]').value`),
      ''
    )
    assert.equal(evaluate(`document.querySelector('${submit}').disabled`), true)
    run('fill', '.ant-modal input[name="name"]', 'Новый черновик')
    run('click', '.ant-modal button:has-text("Отмена")')
    waitFor(`!new URLSearchParams(${search}).has('dialog')`)
    assert.equal(evaluate(route), '/application_groups/1/application/101')
    assert.equal(
      evaluate(`new URLSearchParams(${search}).get('search')`),
      'Группа'
    )
    assert.equal(evaluate('window.layoutFixtures.mutationCalls.length'), 0)
  })
  check(
    'group editing returns to clean state and keeps draft on refresh',
    () => {
      run(
        'click',
        '.applications-page__groups button[aria-label="Действия с выбранным элементом"]'
      )
      run('click', '.ant-dropdown-menu-item:has-text("Редактировать")')
      run('wait', '.ant-modal')
      assert.equal(
        evaluate(`document.querySelector('${submit}').disabled`),
        true
      )
      run('fill', '.ant-modal input[name="name"]', 'Изменённая группа')
      assert.equal(
        evaluate(`document.querySelector('${submit}').disabled`),
        false
      )
      run('fill', '.ant-modal input[name="name"]', 'Группа 1')
      assert.equal(
        evaluate(`document.querySelector('${submit}').disabled`),
        true
      )
      run('fill', '.ant-modal input[name="name"]', 'Черновик')
      evaluate(
        `window.layoutFixtures.applicationGroups[0]={...window.layoutFixtures.applicationGroups[0],description:'Обновление сервера'};window.layoutTest.show('/application_groups/1/application/101?search=Группа',false,false)`
      )
      assert.equal(
        evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        'Черновик'
      )
      run('click', '.ant-modal button:has-text("Отмена")')
    }
  )
  check(
    'application search filters groups without navigating automatically',
    () => {
      show('/application_groups/1/application/101?searchType=app')
      run(
        'fill',
        '.applications-page__groups input[placeholder="Название или ID приложения"]',
        'Приложение 80'
      )
      waitFor(
        `new URLSearchParams(${search}).get('appSearch') === 'Приложение 80'`
      )
      assert.equal(evaluate(route), '/application_groups/1/application/101')
      assert.equal(
        evaluate(
          `document.querySelectorAll('.applications-page__groups .ant-list-item-meta-title').length`
        ),
        1
      )
      run(
        'click',
        '.applications-page__groups .ant-list-item-meta-title:has-text("Группа 2")'
      )
      waitFor(`${route} === '/application_groups/2'`)
    }
  )
  check(
    'new app has group context and cancellation preserves selection',
    () => {
      show('/application_groups/1/application/101')
      run('click', 'button[aria-label="Новое приложение"]')
      run('wait', '.ant-modal')
      assert.equal(
        evaluate(
          `document.querySelector('.ant-modal').textContent.includes('Группа 1')`
        ),
        true
      )
      assert.equal(
        evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        ''
      )
      run('click', '.ant-modal button:has-text("Отмена")')
      assert.equal(evaluate(route), '/application_groups/1/application/101')
    }
  )
  check('app editing returns to clean state', () => {
    run('click', 'button:has-text("Изменить приложение")')
    run('wait', '.ant-modal')
    run('fill', '.ant-modal input[name="name"]', 'Черновик приложения')
    assert.equal(
      evaluate(`document.querySelector('${submit}').disabled`),
      false
    )
    run('fill', '.ant-modal input[name="name"]', 'Приложение 1')
    assert.equal(evaluate(`document.querySelector('${submit}').disabled`), true)
    run('click', '.ant-modal button:has-text("Отмена")')
  })
  check('ID generation failure keeps the form and avoids NaN', () => {
    evaluate(
      `window.layoutFixtures.mutationResults.nextAppId={error:{response:{status:500}}}`
    )
    run('click', 'button[aria-label="Новое приложение"]')
    run('click', '.ant-modal button:has-text("Получить ID")')
    waitFor(
      `document.body.textContent.includes('Не удалось получить идентификатор приложения')`
    )
    assert.equal(
      evaluate(
        `document.querySelector('.ant-modal input[role="spinbutton"]').value`
      ),
      ''
    )
    assert.equal(
      evaluate(`document.querySelector('.ant-modal') !== null`),
      true
    )
  })
  check('valid generated ID is assigned using a mocked response', () => {
    evaluate('window.layoutFixtures.mutationResults.nextAppId={data:901}')
    run('click', '.ant-modal button:has-text("Получить ID")')
    waitFor(
      `document.querySelector('.ant-modal input[role="spinbutton"]').value === '901'`
    )
    run('click', '.ant-modal button:has-text("Отмена")')
  })
  check('pending and failed group save retains the draft', () => {
    evaluate('window.layoutFixtures.mutationResults.createGroup={pending:true}')
    run('click', 'button:has-text("Новая группа")')
    run('fill', '.ant-modal input[name="name"]', 'Черновик группы')
    run('click', submit)
    waitFor(`document.querySelector('.ant-modal input[name="name"]').disabled`)
    assert.equal(evaluate(`document.querySelector('${submit}').disabled`), true)
    assert.equal(
      evaluate(
        `[...document.querySelectorAll('.ant-modal button')].find(button=>button.textContent==='Отмена').disabled`
      ),
      true
    )
    assert.equal(
      evaluate(
        `window.layoutFixtures.mutationCalls.filter(call=>call.name==='createGroup').length`
      ),
      1
    )
    evaluate(
      'window.layoutFixtures.finishMutation({error:{response:{status:500}}})'
    )
    waitFor(`!document.querySelector('.ant-modal input[name="name"]').disabled`)
    assert.equal(
      evaluate(`document.querySelector('.ant-modal input[name="name"]').value`),
      'Черновик группы'
    )
    run('click', '.ant-modal button:has-text("Отмена")')
  })
  check(
    'duplicate application ID stays in the form without creating an app',
    () => {
      evaluate(
        `window.layoutFixtures.mutationResults.createApp={error:{response:{status:400,data:{errorCode:'604'}}}}`
      )
      run('click', 'button[aria-label="Новое приложение"]')
      run('fill', '.ant-modal input[role="spinbutton"]', '102')
      run('fill', '.ant-modal input[name="name"]', 'Черновик приложения')
      run('click', submit)
      waitFor(
        `document.querySelector('.ant-modal').textContent.includes('Приложение с таким ID уже существует')`
      )
      assert.equal(
        evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        'Черновик приложения'
      )
      assert.equal(evaluate('window.layoutFixtures.applications.length'), 80)
      run('click', '.ant-modal button:has-text("Отмена")')
    }
  )
  check(
    'failed token issue keeps the dialog and does not report success',
    () => {
      evaluate(
        'window.layoutFixtures.mutationResults.createToken={error:{response:{status:503}}}'
      )
      run('click', '.token-content__header button:has-text("Выпустить токен")')
      run('click', submit)
      waitFor(
        `document.body.textContent.includes('Не удалось выпустить токен')`
      )
      assert.equal(
        evaluate(`document.querySelector('.ant-modal') !== null`),
        true
      )
      assert.equal(
        evaluate(`document.body.textContent.includes('Токен выпущен')`),
        false
      )
      assert.deepEqual(
        evaluate(
          `window.layoutFixtures.mutationCalls.filter(call=>call.name==='createToken').at(-1).args`
        ),
        { appId: 101, expireTimeMs: 86400000 }
      )
      assert.equal(evaluate('window.layoutFixtures.tokens[101].length'), 40)
      run('click', '.ant-modal button:has-text("Отмена")')
    }
  )
  for (const service of ['groups', 'groupApps', 'tokens'])
    check(`${service}: failure stays local with retry`, () => {
      evaluate(
        `window.layoutFixtures.queryStates.${service}={isError:true,data:undefined,currentData:undefined}`
      )
      show('/application_groups/1/application/101')
      assert.equal(
        evaluate(`!!document.querySelector('.ant-alert-error')`),
        true
      )
      run('click', 'button:has-text("Повторить")')
      assert.equal(evaluate('window.layoutFixtures.retried'), service)
      evaluate(`window.layoutFixtures.queryStates.${service}={}`)
    })
  check('missing group and application have distinct states', () => {
    show('/application_groups/999')
    assert.equal(
      evaluate(`document.body.textContent.includes('Группа не найдена')`),
      true
    )
    show('/application_groups/1/application/999')
    assert.equal(
      evaluate(
        `document.body.textContent.includes('Приложение не найдено в этой группе')`
      ),
      true
    )
  })
  check('read-only app data does not depend on token permission', () => {
    evaluate(
      `window.layoutFixtures.grantedPermissions=['application_group_view']`
    )
    show('/application_groups/1/application/101')
    assert.equal(
      evaluate(
        `document.querySelector('.applications-content__details .page-header__title').textContent`
      ),
      'Приложение 1'
    )
    assert.equal(
      evaluate(
        `document.body.textContent.includes('Нет права просматривать токены')`
      ),
      true
    )
    assert.equal(
      evaluate(
        `[...document.querySelectorAll('button')].some(button=>['Новая группа','Новое приложение','Изменить группу','Изменить приложение'].includes(button.textContent))`
      ),
      false
    )
  })
  check('denied access skips group and global app queries', () => {
    evaluate('window.layoutFixtures.grantedPermissions=[]')
    show('/application_groups/1')
    assert.equal(evaluate(`!!document.querySelector('.ant-result-403')`), true)
    for (const service of ['groups', 'allApps'])
      assert.equal(
        evaluate(
          `window.layoutFixtures.queryCalls.filter(call=>call.service==='${service}').at(-1).skip`
        ),
        true
      )
    evaluate('delete window.layoutFixtures.grantedPermissions')
  })
  console.log(
    `${passed} checks passed; local fixture responses only, CSP connect-src none`
  )
} finally {
  run('close')
}
