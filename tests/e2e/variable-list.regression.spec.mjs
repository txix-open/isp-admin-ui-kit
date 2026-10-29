import { expect, test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('variable list', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const waitFor = async (code) => {
    await expect.poll(() => evaluate(code), { timeout: 5000 }).toBeTruthy()
  }
  async function show(path = '/variables', width = 1440) {
    await page.setViewportSize({
      width: width,
      height: width < 768 ? 812 : 1440
    })
    await page.mouse.move(width - 20, width < 768 ? 792 : 1420)
    await evaluate(`window.layoutTest.show(${JSON.stringify(path)})`)
    await page.locator('.variables-page, .ant-result-403').first().waitFor()
  }
  const search = `document.querySelector('[data-testid="test-route"]').dataset.search`
  const route = `document.querySelector('[data-testid="test-route"]').textContent`

  const check = (name, verify) => test.step(name, verify)

  await page.goto(fixture.href)
  for (const width of [2560, 375])
    await check(`layout and local scrolling at ${width}px`, async () => {
      await show('/variables', width)
      assert.equal(await evaluate('window.layoutTest.check().passed'), true)
      assert.equal(await evaluate('document.querySelectorAll("h1").length'), 1)
    })
  await check('pagination is stored in the URL', async () => {
    await show()
    await page.locator('.ant-pagination-next button').click()
    await waitFor(`new URLSearchParams(${search}).get('page') === '2'`)
    assert.equal(
      await evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      17
    )
  })
  await check(
    'column filter resets the page and persists in the URL',
    async () => {
      await page
        .locator('th:has-text("Наименование") .ant-table-filter-trigger')
        .click()
      await page
        .locator('input[aria-label="Значение фильтра"]')
        .fill('APP_TIMEOUT')
      await page.locator('button:has-text("Найти")').click()
      await waitFor(
        `new URLSearchParams(${search}).get('name') === 'APP_TIMEOUT'`
      )
      assert.equal(
        await evaluate(`new URLSearchParams(${search}).has('page')`),
        false
      )
      assert.equal(
        await evaluate(
          `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
        ),
        1
      )
    }
  )
  await check('editor return keeps the table state', async () => {
    await show('/variables?name=APP_TIMEOUT&sort=name&order=descend')
    await page.locator('a:has-text("APP_TIMEOUT")').click()
    await waitFor(`${route} === '/variables/APP_TIMEOUT'`)
    await page.locator('button:has-text("К переменным")').click()
    await waitFor(`${route} === '/variables'`)
    assert.equal(
      await evaluate(search),
      '?name=APP_TIMEOUT&sort=name&order=descend'
    )
    assert.equal(
      await evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      1
    )
  })
  await check(
    'column sorting is stored in the URL and applied to rows',
    async () => {
      await show()
      await page
        .locator('th:has-text("Наименование") .ant-table-column-sorters')
        .click()
      await waitFor(`new URLSearchParams(${search}).get('sort') === 'name'`)
      assert.equal(
        await evaluate(`new URLSearchParams(${search}).get('order')`),
        'ascend'
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-table-tbody tr[data-row-key]').dataset.rowKey`
        ),
        'API_KEY'
      )
    }
  )
  await check('empty search can reset only table parameters', async () => {
    await show(
      '/variables?name=MISSING&sort=name&order=ascend&page=99&external=keep'
    )
    assert.equal(
      await evaluate(
        `document.body.textContent.includes('По заданным условиям переменные не найдены')`
      ),
      true
    )
    await page.locator('[data-testid="variables-table__clear-all-btn"]').click()
    await waitFor(`${search} === '?external=keep'`)
  })
  await check('view-only users can open a variable', async () => {
    await evaluate(`window.layoutFixtures.grantedPermissions=['variable_view']`)
    await show('/variables?name=APP_TIMEOUT')
    assert.equal(
      await evaluate(
        `document.querySelectorAll('[data-testid="variables-table__edit-config-btn"], [data-testid="variables-table__delete-config-btn"]').length`
      ),
      0
    )
    await page.locator('a:has-text("APP_TIMEOUT")').click()
    await waitFor(`${route} === '/variables/APP_TIMEOUT'`)
    assert.equal(
      await evaluate(
        `document.querySelector('[data-testid="variable-editor-header__save-btn"]')`
      ),
      null
    )
  })
  await check(
    'delete permission is independent of edit permission; used variables stay protected',
    async () => {
      await evaluate(
        `window.layoutFixtures.grantedPermissions=['variable_view','variable_delete'];window.layoutFixtures.variables.APP_TIMEOUT.containsInConfigs=[{id:'config',moduleId:1,name:'Конфигурация'}]`
      )
      await show('/variables?name=APP_TIMEOUT')
      assert.equal(
        await evaluate(
          `document.querySelector('[data-testid="variables-table__delete-config-btn"]').disabled`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `document.querySelector('[data-testid="variables-table__edit-config-btn"]')`
        ),
        null
      )
      await evaluate(
        'window.layoutFixtures.variables.APP_TIMEOUT.containsInConfigs=[]'
      )
      await show('/variables?name=APP_TIMEOUT')
      assert.equal(
        await evaluate(
          `document.querySelector('[data-testid="variables-table__delete-config-btn"]').disabled`
        ),
        false
      )
      await evaluate('delete window.layoutFixtures.grantedPermissions')
    }
  )
  await check('pending deletion prevents repeated row actions', async () => {
    await evaluate(`window.layoutFixtures.removingName='VAR_0'`)
    await show()
    assert.equal(
      await evaluate(
        `document.querySelector('[aria-label="Удалить переменную VAR_0"]').classList.contains('ant-btn-loading')`
      ),
      true
    )
    assert.equal(
      await evaluate(
        `document.querySelector('[aria-label="Удалить переменную VAR_1"]').disabled`
      ),
      true
    )
    await evaluate('delete window.layoutFixtures.removingName')
  })
  await check('load error stays on the page with retry', async () => {
    await evaluate(
      'window.layoutFixtures.queryStates.variables={isError:true,data:undefined}'
    )
    await show()
    assert.equal(
      await evaluate(`!!document.querySelector('.ant-alert-error')`),
      true
    )
    assert.equal(await evaluate(route), '/variables')
    assert.equal(
      await evaluate(`document.querySelector('.admin-table-empty')`),
      null
    )
    await page.locator('button:has-text("Повторить")').click()
    assert.equal(await evaluate('window.layoutFixtures.retried'), 'variables')
  })
  await check(
    'loading keeps the page heading and shows a data indicator',
    async () => {
      await evaluate(
        'window.layoutFixtures.queryStates.variables={isFetching:true,data:undefined}'
      )
      await show()
      assert.equal(
        await evaluate(`document.querySelector('h1').textContent`),
        'Переменные'
      )
      assert.equal(
        await evaluate(`!!document.querySelector('.ant-spin-spinning')`),
        true
      )
      assert.equal(
        await evaluate(`document.querySelector('.admin-table-empty')`),
        null
      )
    }
  )
  await check(
    'an empty collection is distinguished from a load error',
    async () => {
      await evaluate('window.layoutFixtures.queryStates.variables={data:[]}')
      await show()
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Переменных пока нет')`
        ),
        true
      )
      assert.equal(
        await evaluate(`document.querySelector('.ant-alert-error')`),
        null
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.admin-table-empty button').textContent`
        ),
        'Новая переменная'
      )
    }
  )
  await check('refresh error retains cached rows', async () => {
    await evaluate('window.layoutFixtures.queryStates.variables={isError:true}')
    await show()
    assert.equal(
      await evaluate(
        `document.querySelectorAll('.ant-table-tbody tr[data-row-key]').length`
      ),
      50
    )
    await evaluate('window.layoutFixtures.queryStates.variables={}')
  })
  await check(
    'denied access keeps the heading and skips the query',
    async () => {
      await evaluate('window.layoutFixtures.grantedPermissions=[]')
      await show()
      assert.equal(
        await evaluate(`document.querySelector('.page-header h1').textContent`),
        'Переменные'
      )
      assert.equal(
        await evaluate(
          `Boolean(document.querySelector('.page-layout__body .ant-result-403'))`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `window.layoutFixtures.queryCalls.filter(call=>call.service==='variables').at(-1).skip`
        ),
        true
      )
    }
  )
})
