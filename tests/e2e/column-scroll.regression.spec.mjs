import { expect, test } from '@playwright/test'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('long group and application names stay inside navigation columns', async ({
  page
}) => {
  await page.goto(fixture.href)
  const name = 'ДлинноеНазвание'.repeat(40)
  await page.evaluate((name) => {
    const { applicationGroups, applications } = window.layoutFixtures
    applicationGroups[0].name = name
    applications[0].name = name
  }, name)

  for (const { width, dark } of [
    { width: 1440, dark: false },
    { width: 375, dark: true }
  ]) {
    await page.setViewportSize({ width, height: 900 })
    for (const [path, selector] of [
      [
        '/application_groups',
        '.applications-page__groups .ant-list-item-meta-title'
      ],
      [
        '/application_groups/1',
        '.applications-content__list .ant-list-item-meta-title'
      ]
    ]) {
      await page.evaluate(
        ({ path, dark }) => window.layoutTest.show(path, dark),
        { path, dark }
      )
      const title = page.locator(selector).filter({ hasText: name }).first()
      await expect(title).toBeVisible()
      await expect(title).toHaveCSS('text-overflow', 'ellipsis')
      expect(
        await title.evaluate((element) => {
          const row = element.closest('.ant-list-item')
          const lineHeight = parseFloat(getComputedStyle(element).lineHeight)
          const singleLine = element.clientHeight <= lineHeight + 1
          const titleFits = singleLine
            ? element.scrollWidth > element.clientWidth
            : Math.abs(element.clientHeight - 2 * lineHeight) <= 1 &&
              element.scrollWidth <= element.clientWidth + 1
          return titleFits && row.scrollWidth <= row.clientWidth + 1
        })
      ).toBe(true)
    }
  }
})

test('deep links reveal the selection and refresh preserves manual column scroll', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(fixture.href)
  await page.evaluate(() =>
    window.layoutTest.show('/modules/140/configurations')
  )
  const list = page.locator('.column__items .simplebar-content-wrapper')
  const selected = list.locator('.column__items__item.active')
  await expect(selected).toBeInViewport({ ratio: 1 })

  await list.hover()
  await page.mouse.wheel(0, -20000)
  await expect
    .poll(() => list.evaluate((element) => element.scrollTop))
    .toBeLessThan(10)

  await page.clock.install()
  for (let refresh = 0; refresh < 3; refresh++) {
    await page.evaluate(() => {
      window.layoutFixtures.modules = window.layoutFixtures.modules.map(
        (module) => ({ ...module })
      )
      window.layoutTest.show('/modules/140/configurations', false, false)
    })
    // Let the deferred selection reveal run if a refresh scheduled it again.
    await page.clock.runFor(500)
    await expect(selected).not.toBeInViewport()
    expect(await list.evaluate((element) => element.scrollTop)).toBeLessThan(10)
  }
})
