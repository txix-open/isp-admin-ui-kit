import { expect, test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('page headers', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const metrics = `Array.from(document.querySelectorAll('.page-header')).filter(header=>header.getBoundingClientRect().height>0).map(header=>{const style=getComputedStyle(header);const title=getComputedStyle(header.querySelector('.page-header__title'));return {padding:style.padding,color:style.color,background:style.backgroundColor,border:style.borderBottomWidth,font:title.fontFamily,size:title.fontSize,weight:title.fontWeight,line:title.lineHeight,gap:getComputedStyle(header.querySelector('.page-header__inner')).gap}})`
  const screenFrames = `Array.from(document.querySelectorAll('.page-header--screen')).map(header => {const style = getComputedStyle(header); return [style.borderTopWidth, style.borderRadius, style.boxShadow]})`
  const paths = [
    '/',
    '/modules',
    '/modules/1/connections',
    '/modules/1/configurations/7/all_versions',
    '/app_access',
    '/app_access/101',
    '/users',
    '/users/new',
    '/roles/1',
    '/variables',
    '/variables/APP_TIMEOUT',
    '/application_groups/1/application/101',
    '/sessions',
    '/security_logs',
    '/modules/relations',
    '/header-preview/profile',
    '/header-preview/git',
    '/header-preview/configuration'
  ]
  const styleExamples = new Set([
    '/',
    '/modules/1/configurations/7/all_versions',
    '/variables',
    '/application_groups/1/application/101'
  ])
  // Other scenarios already check the layout of these routes at both widths.
  const layoutCoveredElsewhere = new Set([
    '/users',
    '/users/new',
    '/roles/1',
    '/variables',
    '/variables/APP_TIMEOUT',
    '/application_groups/1/application/101',
    '/sessions',
    '/security_logs'
  ])

  await page.goto(fixture.href)
  for (const width of [2560, 375]) {
    let baseline
    let frameBaseline
    await page.setViewportSize({
      width,
      height: width === 375 ? 812 : 1440
    })
    for (const path of paths) {
      const checkStyle = styleExamples.has(path)
      const checkLayout = !layoutCoveredElsewhere.has(path)
      if (width === 375 && !checkStyle && !checkLayout) continue

      await page.mouse.move(width - 20, 790)
      await evaluate(`window.layoutTest.show('${path}')`)
      await expect(page.getByTestId('test-route')).toHaveText(path)
      await expect(page.locator('.page-header--screen').first()).toBeVisible()
      if (checkLayout) {
        assert.equal(
          await evaluate('window.layoutTest.check().passed'),
          true,
          path
        )
      }
      if (!checkStyle) continue

      const frames = await evaluate(screenFrames)
      frameBaseline ??= frames[0]
      for (const frame of frames) {
        assert.equal(frame[0], '1px', path)
        assert.equal(frame[1], '16px', path)
        assert.notEqual(frame[2], 'none', path)
        assert.deepEqual(frame, frameBaseline, path)
      }
      const headers = await evaluate(metrics)
      baseline ??= headers[0]
      for (const header of headers) {
        assert.equal(header.padding, '8px 16px', path)
        assert.equal(header.size, '22px', path)
        assert.equal(header.gap, '8px 12px', path)
        assert.deepEqual(header, baseline, path)
      }
    }
  }
  for (const state of [{ isLoading: true }, { isError: true }]) {
    await evaluate(
      `window.layoutFixtures.queryStates.map=${JSON.stringify(state)};window.layoutTest.show('/modules/relations')`
    )
    await page.locator('.page-header').first().waitFor()
    assert.equal(
      await evaluate(`document.querySelector('h1').textContent`),
      'Карта связей модулей'
    )
    assert.equal(await evaluate('window.layoutTest.check().passed'), true)
  }
})
