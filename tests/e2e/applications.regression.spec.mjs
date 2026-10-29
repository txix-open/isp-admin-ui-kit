import { expect, test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('applications', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const waitFor = async (code) => {
    await expect.poll(() => evaluate(code), { timeout: 5000 }).toBeTruthy()
  }
  async function show(path, width = 2560) {
    await page.setViewportSize({
      width: width,
      height: width < 768 ? 812 : 1440
    })
    await page.mouse.move(width - 20, width < 768 ? 790 : 1420)
    await evaluate(`window.layoutTest.show(${JSON.stringify(path)})`)
    await page
      .locator('.applications-screen, .ant-result-403')
      .first()
      .waitFor()
  }
  const route = `document.querySelector('[data-testid="test-route"]').textContent`
  const search = `document.querySelector('[data-testid="test-route"]').dataset.search`
  const visible = async (selector) =>
    await evaluate(
      `(() => { const e=document.querySelector(${JSON.stringify(selector)}); return Boolean(e && e.getBoundingClientRect().height); })()`
    )
  const submit = '.ant-modal button[type="submit"]'

  const check = (name, verify) => test.step(name, verify)

  await page.goto(fixture.href)
  for (const width of [2560, 375]) {
    for (const path of [
      '/application_groups',
      '/application_groups/1',
      '/application_groups/1/application/101'
    ]) {
      await check(`${path} at ${width}px`, async () => {
        await show(path, width)
        assert.equal(await evaluate('window.layoutTest.check().passed'), true)
        if (width === 375) {
          assert.equal(
            await visible('.applications-page__groups'),
            path === '/application_groups'
          )
          if (path.includes('/1')) {
            assert.equal(
              await visible('.applications-content__list'),
              !path.includes('/application/')
            )
            assert.equal(
              await visible('.applications-content__details'),
              path.includes('/application/')
            )
          }
        }
      })
    }
  }
  await check('mobile back returns through apps and groups', async () => {
    await page.locator('button:has-text("К приложениям")').click()
    await waitFor(`${route} === '/application_groups/1'`)
    await page.locator('button[aria-label="К группам"]').click()
    await waitFor(`${route} === '/application_groups'`)
  })
  await check(
    'groups and apps remain visible beside selected app data',
    async () => {
      await show('/application_groups/1/application/101')
      assert.equal(await visible('.applications-page__groups'), true)
      assert.equal(await visible('.applications-content__list'), true)
      assert.equal(await visible('.token-content'), true)
      assert.equal(
        await evaluate(
          `[...document.querySelectorAll('.applications-page .column')].filter(element=>element.getBoundingClientRect().height>0).length`
        ),
        2
      )
    }
  )
  await check(
    'new group preserves the selected app and URL filters',
    async () => {
      await show('/application_groups/1/application/101?search=Группа')
      await page.locator('button:has-text("Новая группа")').click()
      await page.locator('.ant-modal').first().waitFor()
      assert.equal(
        await evaluate(route),
        '/application_groups/1/application/101'
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        ''
      )
      assert.equal(
        await evaluate(`document.querySelector('${submit}').disabled`),
        true
      )
      await page.locator('.ant-modal input[name="name"]').fill('Новый черновик')
      await page.locator('.ant-modal button:has-text("Отмена")').click()
      await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
      await waitFor(`!new URLSearchParams(${search}).has('dialog')`)
      assert.equal(
        await evaluate(route),
        '/application_groups/1/application/101'
      )
      assert.equal(
        await evaluate(`new URLSearchParams(${search}).get('search')`),
        'Группа'
      )
      assert.equal(
        await evaluate('window.layoutFixtures.mutationCalls.length'),
        0
      )
    }
  )
  await check(
    'group editing returns to clean state and keeps draft on refresh',
    async () => {
      await page
        .locator(
          '.applications-page__groups button[aria-label="Действия с выбранным элементом"]'
        )
        .click()
      await page
        .locator('.ant-dropdown-menu-item:has-text("Редактировать")')
        .click()
      await page.locator('.ant-modal').first().waitFor()
      assert.equal(
        await evaluate(`document.querySelector('${submit}').disabled`),
        true
      )
      await page
        .locator('.ant-modal input[name="name"]')
        .fill('Изменённая группа')
      assert.equal(
        await evaluate(`document.querySelector('${submit}').disabled`),
        false
      )
      await page.locator('.ant-modal input[name="name"]').fill('Группа 1')
      assert.equal(
        await evaluate(`document.querySelector('${submit}').disabled`),
        true
      )
      await page.locator('.ant-modal input[name="name"]').fill('Черновик')
      await evaluate(
        `window.layoutFixtures.applicationGroups[0]={...window.layoutFixtures.applicationGroups[0],description:'Обновление сервера'};window.layoutTest.show('/application_groups/1/application/101?search=Группа',false,false)`
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        'Черновик'
      )
      await page.locator('.ant-modal button:has-text("Отмена")').click()
      await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
    }
  )
  await check(
    'application search filters groups without navigating automatically',
    async () => {
      await show('/application_groups/1/application/101?searchType=app')
      await page
        .locator(
          '.applications-page__groups input[placeholder="Название или ID приложения"]'
        )
        .fill('Приложение 80')
      await waitFor(
        `new URLSearchParams(${search}).get('appSearch') === 'Приложение 80'`
      )
      assert.equal(
        await evaluate(route),
        '/application_groups/1/application/101'
      )
      assert.equal(
        await evaluate(
          `document.querySelectorAll('.applications-page__groups .ant-list-item-meta-title').length`
        ),
        1
      )
      await page
        .locator(
          '.applications-page__groups .ant-list-item-meta-title:has-text("Группа 2")'
        )
        .click()
      await waitFor(`${route} === '/application_groups/2'`)
    }
  )
  await check(
    'new app has group context and cancellation preserves selection',
    async () => {
      await show('/application_groups/1/application/101')
      await page.locator('button[aria-label="Новое приложение"]').click()
      await page.locator('.ant-modal').first().waitFor()
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal').textContent.includes('Группа 1')`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        ''
      )
      await page.locator('.ant-modal button:has-text("Отмена")').click()
      assert.equal(
        await evaluate(route),
        '/application_groups/1/application/101'
      )
    }
  )
  await check('app editing returns to clean state', async () => {
    await page.locator('button:has-text("Изменить приложение")').click()
    await page.locator('.ant-modal').first().waitFor()
    await page
      .locator('.ant-modal input[name="name"]')
      .fill('Черновик приложения')
    assert.equal(
      await evaluate(`document.querySelector('${submit}').disabled`),
      false
    )
    await page.locator('.ant-modal input[name="name"]').fill('Приложение 1')
    assert.equal(
      await evaluate(`document.querySelector('${submit}').disabled`),
      true
    )
    await page.locator('.ant-modal button:has-text("Отмена")').click()
  })
  await check(
    'ID generation failure keeps the form and avoids NaN',
    async () => {
      await evaluate(
        `window.layoutFixtures.mutationResults.nextAppId={error:{response:{status:500}}}`
      )
      await page.locator('button[aria-label="Новое приложение"]').click()
      await page.locator('.ant-modal button:has-text("Получить ID")').click()
      await waitFor(
        `document.body.textContent.includes('Не удалось получить идентификатор приложения')`
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal input[role="spinbutton"]').value`
        ),
        ''
      )
      assert.equal(
        await evaluate(`document.querySelector('.ant-modal') !== null`),
        true
      )
    }
  )
  await check(
    'valid generated ID is assigned using a mocked response',
    async () => {
      await evaluate(
        'window.layoutFixtures.mutationResults.nextAppId={data:901}'
      )
      await page.locator('.ant-modal button:has-text("Получить ID")').click()
      await waitFor(
        `document.querySelector('.ant-modal input[role="spinbutton"]').value === '901'`
      )
      await page.locator('.ant-modal button:has-text("Отмена")').click()
      await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
    }
  )
  await check('pending and failed group save retains the draft', async () => {
    await evaluate(
      'window.layoutFixtures.mutationResults.createGroup={pending:true}'
    )
    await page.locator('button:has-text("Новая группа")').click()
    await page.locator('.ant-modal input[name="name"]').fill('Черновик группы')
    await page.locator(submit).click()
    await waitFor(
      `document.querySelector('.ant-modal input[name="name"]').disabled`
    )
    assert.equal(
      await evaluate(`document.querySelector('${submit}').disabled`),
      true
    )
    assert.equal(
      await evaluate(
        `[...document.querySelectorAll('.ant-modal button')].find(button=>button.textContent==='Отмена').disabled`
      ),
      true
    )
    assert.equal(
      await evaluate(
        `window.layoutFixtures.mutationCalls.filter(call=>call.name==='createGroup').length`
      ),
      1
    )
    await evaluate(
      'window.layoutFixtures.finishMutation({error:{response:{status:500}}})'
    )
    await waitFor(
      `!document.querySelector('.ant-modal input[name="name"]').disabled`
    )
    assert.equal(
      await evaluate(
        `document.querySelector('.ant-modal input[name="name"]').value`
      ),
      'Черновик группы'
    )
    await page.locator('.ant-modal button:has-text("Отмена")').click()
    await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
  })
  await check(
    'duplicate application ID stays in the form without creating an app',
    async () => {
      await evaluate(
        `window.layoutFixtures.mutationResults.createApp={error:{response:{status:400,data:{errorCode:'604'}}}}`
      )
      await page.locator('button[aria-label="Новое приложение"]').click()
      await page.locator('.ant-modal input[role="spinbutton"]').fill('102')
      await page
        .locator('.ant-modal input[name="name"]')
        .fill('Черновик приложения')
      await page.locator(submit).click()
      await waitFor(
        `document.querySelector('.ant-modal').textContent.includes('Приложение с таким ID уже существует')`
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.ant-modal input[name="name"]').value`
        ),
        'Черновик приложения'
      )
      assert.equal(
        await evaluate('window.layoutFixtures.applications.length'),
        80
      )
      await page.locator('.ant-modal button:has-text("Отмена")').click()
      await page.getByRole('button', { name: 'Выйти без сохранения' }).click()
    }
  )
  await check(
    'failed token issue keeps the dialog and does not report success',
    async () => {
      await evaluate(
        'window.layoutFixtures.mutationResults.createToken={error:{response:{status:503}}}'
      )
      await page
        .locator('.token-content__header button:has-text("Выпустить токен")')
        .click()
      await page.locator(submit).click()
      await waitFor(
        `document.body.textContent.includes('Не удалось выпустить токен')`
      )
      assert.equal(
        await evaluate(`document.querySelector('.ant-modal') !== null`),
        true
      )
      assert.equal(
        await evaluate(`document.body.textContent.includes('Токен выпущен')`),
        false
      )
      assert.deepEqual(
        await evaluate(
          `window.layoutFixtures.mutationCalls.filter(call=>call.name==='createToken').at(-1).args`
        ),
        { appId: 101, expireTimeMs: 86400000 }
      )
      assert.equal(
        await evaluate('window.layoutFixtures.tokens[101].length'),
        40
      )
      await page.locator('.ant-modal button:has-text("Отмена")').click()
    }
  )
  for (const service of ['groups', 'groupApps', 'tokens'])
    await check(`${service}: failure stays local with retry`, async () => {
      await evaluate(
        `window.layoutFixtures.queryStates.${service}={isError:true,data:undefined,currentData:undefined}`
      )
      await show('/application_groups/1/application/101')
      assert.equal(
        await evaluate(`!!document.querySelector('.ant-alert-error')`),
        true
      )
      await page.locator('button:has-text("Повторить")').click()
      assert.equal(await evaluate('window.layoutFixtures.retried'), service)
      await evaluate(`window.layoutFixtures.queryStates.${service}={}`)
    })
  await check(
    'missing group and application have distinct states',
    async () => {
      await show('/application_groups/999')
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Группа не найдена')`
        ),
        true
      )
      await show('/application_groups/1/application/999')
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Приложение не найдено в этой группе')`
        ),
        true
      )
    }
  )
  await check(
    'read-only app data does not depend on token permission',
    async () => {
      await evaluate(
        `window.layoutFixtures.grantedPermissions=['application_group_view']`
      )
      await show('/application_groups/1/application/101')
      assert.equal(
        await evaluate(
          `document.querySelector('.applications-content__details .page-header__title').textContent`
        ),
        'Приложение 1'
      )
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Нет права просматривать токены')`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `[...document.querySelectorAll('button')].some(button=>['Новая группа','Новое приложение','Изменить группу','Изменить приложение'].includes(button.textContent))`
        ),
        false
      )
    }
  )
  await check('denied access skips group and global app queries', async () => {
    await evaluate('window.layoutFixtures.grantedPermissions=[]')
    await show('/application_groups/1')
    assert.equal(
      await evaluate(`!!document.querySelector('.ant-result-403')`),
      true
    )
    for (const service of ['groups', 'allApps'])
      assert.equal(
        await evaluate(
          `window.layoutFixtures.queryCalls.filter(call=>call.service==='${service}').at(-1).skip`
        ),
        true
      )
    await evaluate('delete window.layoutFixtures.grantedPermissions')
  })
})
