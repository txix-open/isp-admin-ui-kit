import { test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('modules', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  async function show(path, dark = false) {
    await page.mouse.move(10, 950)
    await evaluate(`window.layoutTest.show(${JSON.stringify(path)}, ${dark})`)
    await page.locator('.page-header').first().waitFor()
  }
  async function route() {
    return await evaluate(
      `document.querySelector('[data-testid="test-route"]').textContent.trim()`
    )
  }
  async function query() {
    return await evaluate(
      `document.querySelector('[data-testid="test-route"]').dataset.search`
    )
  }
  async function savedScroll() {
    return await evaluate(
      `JSON.parse(document.querySelector('[data-testid="test-route"]').dataset.state).moduleScrollTop`
    )
  }
  async function markVisibleAction(label) {
    return await evaluate(
      `(() => {const content=document.querySelector('.modules-page__content').getBoundingClientRect();const button=Array.from(document.querySelectorAll('button[aria-label="${label}"]')).find(button=>{const r=button.getBoundingClientRect();return r.top>=content.top && r.bottom<=content.bottom;});button.dataset.testAction='visible';return button.closest('tr').dataset.rowKey;})()`
    )
  }
  const configPath = '/modules/1/configurations?search=Модуль'
  let passed = 0
  function pass(label) {
    console.log('PASS ' + label)
    passed++
  }

  await page.goto(fixture.href)
  await page.locator('.page-header').first().waitFor()
  await evaluate(`(() => {
    const f = window.layoutFixtures;
    f.realModules = true;
    f.modules = f.modules.map(module => ({ ...module, id: String(module.id), status: [], configSchema: { type: 'object' } }));
    f.modules[0].name = 'Модуль уведомлений';
    f.modules[0].status = [0,1].map(index => ({ id: String(index), version: index ? '2.1.0' : '2.0.0', libVersion: '1.2.0', address: { ip: '127.0.0.1', port: 8000 + index }, establishedAt: '2026-10-29T10:00:00Z', endpoints: [{ path: '/swagger', httpMethod: 'GET', inner: false }] }));
    f.modules[1].name = 'Модуль без конфигураций';
    f.moduleConfigs = { '1': Array.from({ length: 45 }, (_, index) => ({ id: String(index + 7), moduleId: '1', active: index === 0, valid: index !== 2, name: index ? 'Длинное название конфигурации ' + index + ' '.repeat(2) + 'тест'.repeat(30) : 'Основная конфигурация', version: index + 1, updatedAt: '2026-10-29T10:00:00Z', data: { timeout: 30 } })), '2': [] };
    f.versions = f.versions.map(version => ({ ...version, data: { timeout: Number(version.configVersion) } }));
  })()`)

  for (const dark of [false, true])
    for (const width of [2560, 1440, 375]) {
      await page.setViewportSize({
        width: width,
        height: width === 375 ? 812 : 1440
      })
      await show(configPath, dark)
      await page.locator('.active-configurations-table').first().waitFor()
      assert.equal(
        await evaluate(
          `document.querySelectorAll('.active-configurations-table').length`
        ),
        2
      )
      assert.deepEqual(
        await evaluate(
          `Array.from(document.querySelectorAll('.active-configurations-table__title')).map(e=>e.firstChild.textContent)`
        ),
        ['Активная', 'Остальные']
      )
      assert.equal(
        await evaluate(
          `document.querySelectorAll('.modules-page__content').length`
        ),
        1
      )
      assert.equal(
        await evaluate(
          `Array.from(document.querySelectorAll('.ant-table-content')).every(e=>e.scrollWidth <= e.clientWidth + 1)`
        ),
        true,
        `${width}px table overflow`
      )
      assert.equal(
        await evaluate(
          `Array.from(document.querySelectorAll('.column__items__item .ant-badge-count')).some(e=>e.textContent==='2' && getComputedStyle(e).backgroundColor!=='rgba(0, 0, 0, 0)')`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `document.querySelector('.modules-page__module-summary').textContent.includes('2.1.0')`
        ),
        true
      )
      assert.equal(await evaluate('window.layoutTest.check().passed'), true)
      pass(
        `${dark ? 'dark' : 'light'} ${width}px: two tables, full width, coloured count, version retained`
      )
    }

  await page.setViewportSize({ width: 1440, height: 1000 })
  await show(configPath)
  const api = await evaluate(
    `(() => {const a=document.querySelector('[aria-label="API (новая вкладка)"]');return {href:a.getAttribute('href'),target:a.target};})()`
  )
  assert.equal(api.target, '_blank')
  assert.ok(api.href.startsWith('/modules/1/swagger?search='))
  for (let i = 0; i < 3; i++) {
    await page.locator('[role="tab"]:has-text("Подключения")').click()
    await page.locator('.connection-page').first().waitFor()
    assert.equal(
      await evaluate(`document.querySelectorAll('.connection-page').length`),
      1
    )
    assert.equal(
      await evaluate(`document.querySelectorAll('.configurations').length`),
      0
    )
    await page.locator('[role="tab"]:has-text("Конфигурации")').click()
    await page.locator('.configurations').first().waitFor()
    assert.equal(
      await evaluate(`document.querySelectorAll('.configurations').length`),
      1
    )
    assert.equal(
      await evaluate(`document.querySelectorAll('.connection-page').length`),
      0
    )
  }
  pass('tab switches keep exactly one routed screen; API is a separate link')

  await evaluate(
    `document.querySelector('.modules-page__content').scrollTop=450`
  )
  const historyId = await markVisibleAction('Другие действия конфигурации')
  await page.locator('[data-test-action="visible"]').click()
  await page.getByRole('menuitem', { name: /История версий/ }).click()
  await page.locator('.all-version-page').first().waitFor()
  const historyScroll = await savedScroll()
  assert.ok(historyScroll > 0)
  assert.equal(
    await route(),
    `/modules/1/configurations/${historyId}/all_versions`
  )
  assert.ok((await query()).includes('search='))
  await page.locator('button:has-text("К конфигурациям")').click()
  await page.locator('.configurations').first().waitFor()
  assert.equal(
    await evaluate(
      `document.querySelector('.modules-page__content').scrollTop`
    ),
    historyScroll
  )
  pass('history and return retain selection, query and content scroll')

  const editorId = await markVisibleAction('Редактировать конфигурацию')
  await page.locator('[data-test-action="visible"]').click()
  await page.locator('.configuration-editor-page').first().waitFor()
  const editorScroll = await savedScroll()
  assert.ok(editorScroll > 0)
  assert.equal(await route(), `/1/configEditor/${editorId}`)
  assert.ok((await query()).includes('search='))
  await page
    .locator('.configuration-editor-page button:has-text("Назад")')
    .click()
  await page.locator('.configurations').first().waitFor()
  assert.equal(
    await evaluate(
      `document.querySelector('.modules-page__content').scrollTop`
    ),
    editorScroll
  )
  pass('editor return retains module context without saving')

  await page
    .locator(
      '.active-configurations-table button[aria-label^="Просмотреть конфигурацию"] >> nth=0'
    )
    .click()
  await page
    .locator('.configuration-preview-modal .admin-modal')
    .first()
    .waitFor()
  assert.equal(
    await evaluate(`document.querySelector('.modal__title').textContent`),
    'Основная конфигурация'
  )
  await page
    .locator('.admin-modal .modal__footer button:has-text("Закрыть")')
    .click()
  await page.locator('button:has-text("Текущая схема")').click()
  await page.locator('.config-schema-modal .admin-modal').first().waitFor()
  await page
    .locator('.admin-modal .modal__footer button:has-text("Закрыть")')
    .click()
  await page
    .locator(
      '.active-configurations-table button[aria-label="Другие действия конфигурации"] >> nth=0'
    )
    .click()
  await page.getByRole('menuitem', { name: /История версий/ }).click()
  await page
    .getByRole('checkbox', { name: 'Выбрать версию 1 для сравнения' })
    .check()
  await page
    .getByRole('checkbox', { name: 'Выбрать версию 2 для сравнения' })
    .check()
  await page.getByRole('button', { name: 'Сравнить выбранные' }).click()
  await page.locator('.compare-version-modal .admin-modal').waitFor()
  await page.locator('[data-testid="offline-diff"]').first().waitFor()
  assert.equal(
    await evaluate(
      `document.querySelector('[data-testid="offline-diff"]').textContent.includes('timeout')`
    ),
    true
  )
  await page
    .locator('.admin-modal .modal__footer button:has-text("Закрыть")')
    .click()
  assert.equal(
    await evaluate(`document.body.classList.contains('modal-open')`),
    false
  )
  await page.getByRole('button', { name: 'К конфигурациям' }).click()
  pass('preview, schema and version comparison remain available')

  await page
    .locator('.configurations__buttons button:has-text("Новая конфигурация")')
    .click()
  await page.locator('.admin-modal').first().waitFor()
  await page.locator('.admin-modal input').fill('Новая конфигурация для теста')
  await page.locator('.admin-modal button:has-text("Продолжить")').click()
  await page.locator('.configuration-editor-page').first().waitFor()
  assert.equal(await route(), '/1/configEditor/new')
  assert.ok((await query()).includes('search='))
  assert.equal(
    await evaluate(`document.querySelector('.page-header__title').textContent`),
    'Новая конфигурация для теста'
  )
  await page
    .locator('.configuration-editor-page button:has-text("Назад")')
    .click()
  await page.locator('.configurations').first().waitFor()
  assert.equal(
    await evaluate(
      `document.querySelectorAll('.active-configurations-table').length`
    ),
    2
  )
  assert.equal(
    await evaluate(`document.body.classList.contains('modal-open')`),
    false
  )
  await page
    .locator('button[aria-label="Сделать конфигурацию активной"] >> nth=0')
    .click()
  await page.locator('.ant-popconfirm').first().waitFor()
  await page.locator('.ant-popconfirm button:has-text("Отмена")').click()
  assert.equal(await evaluate('window.layoutFixtures.mutationCalls.length'), 0)
  pass(
    'create opens the editor without saving; activation requires confirmation and can be cancelled'
  )

  await page.locator('button:has-text("Карта связей")').click()
  await page.locator('.modules-relations-diagram').first().waitFor()
  await page.locator('button:has-text("К модулям")').click()
  await page.locator('.configurations').first().waitFor()
  assert.equal(await route(), '/modules/1/configurations')
  assert.ok((await query()).includes('search='))
  pass('relations map returns to the selected module')

  assert.equal(await evaluate('window.layoutFixtures.mutationCalls.length'), 0)
})
