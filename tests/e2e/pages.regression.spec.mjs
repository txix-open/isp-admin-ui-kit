import { expect, test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('pages', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const waitFor = async (code) => {
    await expect.poll(() => evaluate(code), { timeout: 5000 }).toBeTruthy()
  }
  async function waitForDrawer() {
    await waitFor(`(() => {
    const panel = document.querySelector('.ant-drawer-open .ant-drawer-content-wrapper');
    if (!panel) return false;
    const rect = panel.getBoundingClientRect();
    return Math.abs(rect.right - innerWidth) < 1 && Math.abs(rect.width - Math.min(960, innerWidth)) < 1;
  })()`)
  }
  async function show(path, width = 2560, dark = false) {
    await page.setViewportSize({
      width: width,
      height: width < 768 ? 812 : 1440
    })
    await evaluate(`window.layoutTest.show(${JSON.stringify(path)}, ${dark})`)
    await waitFor(
      `document.querySelector('[data-testid="test-route"]').textContent === ${JSON.stringify(path.split('?')[0])}`
    )
  }

  const check = (name, verify) => test.step(name, verify)
  const route = `document.querySelector('[data-testid="test-route"]').textContent`

  await page.goto(fixture.href)

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
      await check(`${path} at ${width}px`, async () => {
        await show(path, width)
        assert.equal(await evaluate('window.layoutTest.check().passed'), true)
        assert.equal(
          await evaluate(`document.querySelectorAll('h1').length`),
          1
        )
      })
    }
  }
  await check('new role is a draft with clear actions and focus', async () => {
    await show('/roles/1?search=Оператор')
    await page
      .locator('.roles-page input[name="name"]')
      .fill('Несохранённое название')
    await evaluate(
      `document.querySelector('.roles-page .roles-content').dataset.draftProbe='kept'`
    )
    await page.locator('button:has-text("Новая роль")').click()
    await waitFor(`!!document.querySelector('.ant-drawer-open')`)
    assert.equal(await evaluate(route), '/roles/1')
    assert.equal(
      await evaluate(
        `document.querySelector('.roles-page input[name="name"]').value`
      ),
      'Несохранённое название'
    )
    assert.equal(
      await evaluate(
        `document.querySelector('.roles-page .roles-content').dataset.draftProbe`
      ),
      'kept'
    )
    assert.equal(
      await evaluate(`document.activeElement.textContent`),
      'Новая роль'
    )
    assert.equal(
      await evaluate(
        `document.body.textContent.includes('Роль ещё не создана')`
      ),
      true
    )
    assert.equal(
      await evaluate(
        `document.querySelector('.ant-drawer [data-cy="roles-content__header__save-button"]').disabled`
      ),
      true
    )
    assert.equal(await evaluate('window.layoutFixtures.roles.length'), 1)
    await page
      .locator('.ant-drawer input[name="name"]')
      .fill('Новая тестовая роль')
    await page.locator('button:has-text("Создать роль")').click()
    await waitFor(`document.querySelector('.ant-modal') !== null`)
    assert.equal(await evaluate('window.layoutFixtures.roles.length'), 1)
    await page.locator('.ant-modal button:has-text("Отмена")').click()
    await page.locator('.ant-drawer button:has-text("Отмена")').click()
    await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
    await waitFor(`!document.querySelector('.ant-drawer-open')`)
    assert.equal(await evaluate(route), '/roles/1')
    assert.equal(
      await evaluate(
        `document.querySelector('.roles-page input[name="name"]').value`
      ),
      'Несохранённое название'
    )
    assert.equal(
      await evaluate(
        `new URLSearchParams(document.querySelector('[data-testid="test-route"]').dataset.search).get('search')`
      ),
      'Оператор'
    )
  })
  await check(
    'browser back closes creation and preserves the viewed role',
    async () => {
      await page.locator('button:has-text("Новая роль")').click()
      await waitFor(`!!document.querySelector('.ant-drawer-open')`)
      await evaluate('window.navigateInFixture(-1)')
      await waitFor(`!document.querySelector('.ant-drawer-open')`)
      assert.equal(await evaluate(route), '/roles/1')
      assert.equal(
        await evaluate(
          `document.querySelector('.roles-page input[name="name"]').value`
        ),
        'Несохранённое название'
      )
    }
  )
  for (const width of [2560, 375])
    await check(`direct creation drawer at ${width}px`, async () => {
      await show('/roles/new', width)
      await waitForDrawer()
      assert.equal(await evaluate('window.layoutTest.check().passed'), true)
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-drawer-content-wrapper').getBoundingClientRect().width <= innerWidth`
        ),
        true
      )
      assert.equal(
        await evaluate(`(() => {
        const fields = [...document.querySelectorAll('.ant-drawer input, .ant-drawer .page-header__actions button')];
        return fields.every(field => { const box = field.getBoundingClientRect(); return box.left >= 0 && box.right <= innerWidth + 1; });
      })()`),
        true
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-drawer input[name="name"]').value`
        ),
        ''
      )
      await page.locator('.ant-drawer button:has-text("Отмена")').click()
      await waitFor(`${route} === '/roles'`)
    })
  await check(
    'creation uses add permission while the viewed role remains read-only',
    async () => {
      await evaluate(
        `window.layoutFixtures.grantedPermissions=['role_view','role_add']`
      )
      await show('/roles/1')
      assert.equal(
        await evaluate(
          `document.querySelector('.roles-page input[name="name"]').disabled`
        ),
        true
      )
      await page.locator('button:has-text("Новая роль")').click()
      await waitFor(`!!document.querySelector('.ant-drawer-open')`)
      await page
        .locator('.ant-drawer input[name="name"]')
        .fill('Роль оператора')
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-drawer [data-cy="roles-content__header__save-button"]').disabled`
        ),
        false
      )
      await page.locator('.ant-drawer button:has-text("Отмена")').click()
      await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
      await evaluate('delete window.layoutFixtures.grantedPermissions')
    }
  )

  for (const [path, service] of [
    ['/sessions', 'sessions'],
    ['/security_logs', 'logs']
  ]) {
    await check(
      `${service}: URL pagination and unknown user fallback`,
      async () => {
        await show(`${path}?page=2`)
        assert.equal(
          await evaluate(
            `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).args.offset`
          ),
          10
        )
        assert.equal(
          await evaluate(
            `document.body.textContent.includes('Пользователь #999')`
          ),
          true
        )
        await page.locator('.ant-pagination-next button').click()
        await waitFor(
          `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).args.offset === 20`
        )
      }
    )
    await check(
      `${service}: error and retry replace endless loading`,
      async () => {
        await evaluate(
          `window.layoutFixtures.queryStates.${service}={currentData:undefined,data:undefined,isError:true}`
        )
        await show(path)
        assert.equal(
          await evaluate(`!!document.querySelector('.ant-alert-error')`),
          true
        )
        await page.locator('button:has-text("Повторить")').click()
        assert.equal(await evaluate('window.layoutFixtures.retried'), service)
        await evaluate(`window.layoutFixtures.queryStates.${service}={}`)
      }
    )
    await check(`${service}: denied access skips the list query`, async () => {
      await evaluate('window.layoutFixtures.grantedPermissions=[]')
      await show(path)
      await expect(page.locator('.ant-result-403')).toBeVisible()
      assert.equal(
        await evaluate(
          `window.layoutFixtures.queryCalls.filter(call => call.service === '${service}').at(-1).skip`
        ),
        true
      )
      await evaluate('delete window.layoutFixtures.grantedPermissions')
    })
  }

  await check('dark theme uses the same layout', async () => {
    await show('/security_logs', 1440, true)
    assert.equal(await evaluate('window.layoutTest.check().passed'), true)
  })
})
