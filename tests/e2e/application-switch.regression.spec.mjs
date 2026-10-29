import { test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('application switch', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  await page.goto(fixture.href)
  await page.setViewportSize({ width: 2560, height: 1440 })
  await evaluate(
    `window.layoutTest.show('/application_groups/1/application/101')`
  )
  await page.locator('.token-content').first().waitFor()
  for (const id of [102, 103, 102, 101, 104, 101]) {
    await page
      .locator(
        `.applications-content__list .ant-list-item-meta-title:text-is("Приложение ${id - 100}")`
      )
      .click()
    const actual = await evaluate(
      `({ headers:document.querySelectorAll('.applications-content__details > .page-header').length, tables:document.querySelectorAll('.token-content .ant-table-wrapper').length, title:document.querySelector('.applications-content__details > .page-header .page-header__title')?.textContent, context:document.querySelector('.applications-content__details > .page-header .page-header__context')?.textContent })`
    )
    assert.equal(actual.headers, 1, `Application ${id}: accumulated headers`)
    assert.equal(actual.tables, 1, `Application ${id}: extra token tables`)
    assert.equal(actual.title, `Приложение ${id - 100}`)
    assert.ok(actual.context.includes(`ID ${id}`))
    console.log(`PASS application ${id}: one matching header and token table`)
  }
})
