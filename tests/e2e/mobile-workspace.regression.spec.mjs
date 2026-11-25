import { expect, test } from '@playwright/test'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

const show = (page, path, dark = false) =>
  page.evaluate(
    ([path, dark]) => window.layoutTest.show(path, dark),
    [path, dark]
  )

test('compact rows fit and keep the full columns and existing filter', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(fixture.href)
  const cases = [
    ['/users', 'test@example.invalid', 'Последняя сессия', /Редактировать/],
    ['/variables?value=37', '37', 'Значение', /Редактировать переменную/],
    ['/sessions?page=2', 'Сессия #1', 'Начало сессии', /Завершить сессию #1$/],
    ['/security_logs', 'Пользователь #999', 'Время события']
  ]
  for (const [path, detail, fullColumn, action] of cases) {
    await show(page, path, path.includes('sessions'))
    const table = page.locator('.admin-table--compact')
    await expect(table.getByText(detail, { exact: true }).first()).toBeVisible()
    await expect(
      table.getByRole('columnheader', { name: fullColumn })
    ).toHaveCount(0)
    if (action)
      await expect(
        table.getByRole('button', { name: action }).first()
      ).toBeInViewport()
    expect(
      await table
        .locator('.ant-table-container')
        .evaluate((element) => element.scrollWidth <= element.clientWidth + 1)
    ).toBe(true)
    if (path.startsWith('/variables'))
      await expect(table.locator('tr[data-row-key]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Полная таблица' }).click()
    await expect(
      page.getByRole('columnheader', { name: fullColumn })
    ).toBeVisible()
    await expect(page.getByTestId('test-route')).toHaveAttribute(
      'data-search',
      new URL(path, 'https://example.test').search
    )
    if (path.startsWith('/variables'))
      await expect(page.locator('tr[data-row-key]')).toHaveCount(1)
    await page.getByRole('button', { name: 'Компактный вид' }).click()
    await expect(table).toBeVisible()
  }
})

test('configuration editor keeps the back and save buttons visible', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(fixture.href)
  await show(page, '/1/configEditor/7')
  const header = page.locator('.page-header--screen')
  await expect(
    header.getByRole('button', { name: 'К конфигурациям' })
  ).toBeInViewport()
  await expect(
    header.getByRole('button', { name: 'Сохранить и выйти' })
  ).toBeInViewport()
  expect((await header.boundingBox()).height).toBeLessThan(150)
})

test('bulk audit disable sends no mutation until the counted action is confirmed', async ({
  page
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(fixture.href)
  await page.evaluate(() => {
    window.layoutFixtures.mutationResults.setAuditEvents = { pending: true }
  })
  await show(page, '/auditManagement')
  const disable = page.getByRole('button', {
    name: 'Отключить все',
    exact: true
  })
  const confirm = page.locator('.ant-popconfirm')
  const calls = () => page.evaluate(() => window.layoutFixtures.mutationCalls)
  await disable.click()
  await expect(confirm.getByText(/Будет отключено событий: 2/)).toBeVisible()
  expect(await calls()).toEqual([])
  await confirm.getByRole('button', { name: 'Отмена' }).click()
  await expect(confirm).toBeHidden()
  expect(await calls()).toEqual([])
  await disable.click()
  await confirm
    .getByRole('button', { name: 'Отключить все', exact: true })
    .click()
  await expect(
    page.getByRole('button', { name: 'Включить все' })
  ).toBeDisabled()
  expect(await calls()).toEqual([
    {
      name: 'setAuditEvents',
      args: [
        'login_logout',
        'role_changed',
        'user_changed',
        'user_blocked'
      ].map((event) => ({ event, enabled: false }))
    }
  ])
  await page.evaluate(() =>
    window.layoutFixtures.finishMutation({ data: null })
  )
  await expect(confirm).toBeHidden()
})
