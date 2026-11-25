import { expect, test } from '@playwright/test'
import { readFile } from 'node:fs/promises'

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

test('form fields and keyboard focus remain distinguishable from the workspace', async ({
  page,
  colorScheme
}) => {
  await show(page, '/users', colorScheme === 'dark')
  const header = page.locator('.page-header--screen')
  const exportButton = header.getByRole('button', { name: /^Скачать CSV/ })
  const field = page.getByPlaceholder('Имя, фамилия, email или ID')
  await expect(field).toBeVisible()
  await expect(exportButton).toBeEnabled()
  await page.keyboard.press('Tab')
  await exportButton.focus()

  const contrast = await page.evaluate(() => {
    const channels = (color) => color.match(/\d+(?:\.\d+)?/g).map(Number)
    const luminance = (color) => {
      const [red, green, blue] = channels(color)
        .slice(0, 3)
        .map((value) => {
          const channel = value / 255
          return channel <= 0.04045
            ? channel / 12.92
            : ((channel + 0.055) / 1.055) ** 2.4
        })
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }
    const ratio = (first, second) => {
      const a = luminance(first)
      const b = luminance(second)
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
    }

    const field = document.querySelector('.users-page__filters input')
    const fieldFrame = getComputedStyle(field.closest('.ant-input-filled'))
    const panel = getComputedStyle(document.querySelector('.page-layout__body'))
    const header = getComputedStyle(document.querySelector('.page-header'))
    const button = getComputedStyle(document.activeElement)
    const fieldBackground = channels(fieldFrame.backgroundColor)
    const opacity = fieldBackground[3] ?? 1
    const fieldRgb = channels(panel.backgroundColor)
      .slice(0, 3)
      .map(
        (channel, index) =>
          fieldBackground[index] * opacity + channel * (1 - opacity)
      )
    return {
      fieldBorderColor: fieldFrame.borderTopColor,
      fieldFill: ratio(`rgb(${fieldRgb.join(', ')})`, panel.backgroundColor),
      buttonBorder: ratio(button.borderTopColor, header.backgroundColor),
      placeholder: ratio(
        getComputedStyle(field, '::placeholder').color,
        `rgb(${fieldRgb.join(', ')})`
      ),
      focus: ratio(button.outlineColor, header.backgroundColor),
      focusVisible: document.activeElement.matches(':focus-visible'),
      outlineWidth: Number.parseFloat(button.outlineWidth),
      outlineStyle: button.outlineStyle
    }
  })
  expect(contrast.fieldBorderColor).toBe('rgba(0, 0, 0, 0)')
  expect(contrast.fieldFill).toBeGreaterThan(1)
  expect(contrast.buttonBorder).toBeLessThan(2)
  expect(contrast.placeholder).toBeGreaterThanOrEqual(4.5)
  expect(contrast.focusVisible).toBe(true)
  expect(contrast.outlineStyle).toBe('solid')
  expect(contrast.outlineWidth).toBeGreaterThanOrEqual(2)
  expect(contrast.focus).toBeGreaterThanOrEqual(3)
  await field.focus()
  await expect
    .poll(() =>
      field.evaluate(
        (element) =>
          getComputedStyle(element.closest('.ant-input-filled')).borderTopColor
      )
    )
    .not.toBe(contrast.fieldBorderColor)
})

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

test('CSV export is a secondary header action on all four screens', async ({
  page,
  colorScheme
}) => {
  const html = (await readFile(fixture, 'utf8')).replace(
    "connect-src 'none'",
    "connect-src 'self'"
  )
  await page.route('https://admin.test/', (route) =>
    route.fulfill({ contentType: 'text/html', body: html })
  )
  await page.route('https://admin.test/api/admin/*/download', (route) =>
    route.fulfill({
      contentType: 'text/csv',
      headers: { 'Content-Disposition': 'attachment; filename="export.csv"' },
      body: 'id\n1\n'
    })
  )
  await page.goto('https://admin.test/')

  const cases = [
    ['/users', 'user', { limit: 1000, offset: 0 }],
    ['/roles', 'role', {}],
    ['/sessions?page=2', 'session', { limit: 10, offset: 10 }],
    [
      '/security_logs?page=2',
      'log',
      { limit: 10, offset: 0, query: { message: 'Изменены права' } }
    ]
  ]
  for (const [path, type, params] of cases) {
    await show(page, path, colorScheme === 'dark')
    const button = page
      .locator('.page-header__actions')
      .getByRole('button', { name: /^Скачать CSV/ })
    await expect(button).toBeEnabled()
    await expect(button).toHaveClass(/\bant-btn-default\b/)
    await expect(button).toHaveText(
      {
        user: 'CSV до 1000',
        role: 'CSV всех ролей',
        session: 'CSV страницы',
        log: 'CSV страницы'
      }[type]
    )
    if (type === 'user') {
      const search = page.getByPlaceholder('Имя, фамилия, email или ID')
      await search.fill('Несуществующий пользователь')
      await expect(button).toBeDisabled()
      await expect(
        page.getByText(
          'Для выгрузки CSV снимите фильтры загруженного списка.',
          {
            exact: false
          }
        )
      ).toBeVisible()
      await search.clear()
      await expect(button).toBeEnabled()
    }
    expect(await page.evaluate(() => window.layoutTest.check().passed)).toBe(
      true
    )

    if (type === 'log') {
      await page
        .getByRole('columnheader', { name: /Действие/ })
        .locator('.ant-table-filter-trigger')
        .click()
      const filter = page.getByRole('form', { name: 'Фильтр: Действие' })
      await filter.getByRole('searchbox').fill('Изменены права')
      await filter.getByRole('button', { name: 'Применить' }).click()
      await expect(
        page.getByRole('button', { name: 'Удалить фильтр «Действие»' })
      ).toBeVisible()
    }

    const [request, download] = await Promise.all([
      page.waitForRequest(`https://admin.test/api/admin/${type}/download`),
      page.waitForEvent('download'),
      button.click()
    ])
    expect(request.method()).toBe('POST')
    expect(request.postDataJSON()).toEqual(params)
    expect(download.suggestedFilename()).toBe('export.csv')

    await page.evaluate(() => {
      window.layoutFixtures.grantedPermissions = []
    })
    await show(page, path, colorScheme === 'dark')
    await expect(page.locator('.ant-result-403')).toBeVisible()
    await expect(button).toHaveCount(0)
    await page.evaluate(() => {
      delete window.layoutFixtures.grantedPermissions
    })
  }
})
