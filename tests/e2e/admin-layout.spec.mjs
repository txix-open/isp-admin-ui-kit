import { expect, test } from '@playwright/test'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test.beforeEach(async ({ page }) => {
  await page.goto(fixture.href)
  await expect
    .poll(() => page.evaluate(() => typeof window.layoutTest?.show))
    .toBe('function')
})

const show = (page, path, dark) =>
  page.evaluate(
    ([path, dark]) => window.layoutTest.show(path, dark),
    [path, dark]
  )

test('tables and columns share the same header without document overflow', async ({
  page,
  colorScheme
}) => {
  const dark = colorScheme === 'dark'
  const header = page.locator('.page-header--screen')
  const frame = () =>
    header.evaluate((element) => {
      const style = getComputedStyle(element)
      return [style.padding, style.border, style.borderRadius, style.boxShadow]
    })

  await show(page, '/variables', dark)
  await expect(
    header.getByRole('heading', { name: 'Переменные', exact: true })
  ).toBeVisible()
  const tableHeader = await frame()
  expect(await page.evaluate(() => window.layoutTest.check().passed)).toBe(true)

  await show(page, '/modules', dark)
  await expect(
    header.getByRole('heading', { name: 'Модули', exact: true })
  ).toBeVisible()
  expect(await frame()).toEqual(tableHeader)
  expect(await page.evaluate(() => window.layoutTest.check().passed)).toBe(true)
})

test('canceling user deletion closes the named confirmation', async ({
  page,
  colorScheme
}) => {
  await show(page, '/users', colorScheme === 'dark')
  const table = page.getByRole('table')
  const remove = table
    .getByRole('button', { name: /^Удалить пользователя:/ })
    .first()
  await remove.click()

  const confirmation = page.locator('.ant-popconfirm').filter({
    hasText: 'Удалить пользователя «'
  })
  const rowName = (await remove.getAttribute('aria-label')).replace(
    'Удалить пользователя: ',
    ''
  )
  await expect(
    confirmation.getByText(`Удалить пользователя «${rowName}»?`, {
      exact: true
    })
  ).toBeVisible()
  await confirmation
    .getByRole('button', { name: 'Отмена', exact: true })
    .click()
  await expect(confirmation).toBeHidden()
  await expect(remove).toBeVisible()
})
