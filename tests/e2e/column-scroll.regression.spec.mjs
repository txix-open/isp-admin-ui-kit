import { expect, test } from '@playwright/test'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('deep links reveal the selection and refresh preserves manual column scroll', async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto(fixture.href)
  await page.evaluate(() =>
    window.layoutTest.show('/modules/140/configurations')
  )
  const list = page.locator('.column__items .simplebar-content-wrapper')
  const selected = list.locator('.column__items__item.active')
  await expect(selected).toBeInViewport()

  await list.hover()
  await page.mouse.wheel(0, -20000)
  await expect
    .poll(() => list.evaluate((element) => element.scrollTop))
    .toBeLessThan(10)

  for (let refresh = 0; refresh < 3; refresh++) {
    await page.evaluate(() => {
      window.layoutFixtures.modules = window.layoutFixtures.modules.map(
        (module) => ({ ...module })
      )
      window.layoutTest.show('/modules/140/configurations', false, false)
    })
    await expect(selected).not.toBeInViewport()
    expect(await list.evaluate((element) => element.scrollTop)).toBeLessThan(10)
  }
})
