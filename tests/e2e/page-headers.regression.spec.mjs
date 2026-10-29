import { test } from '@playwright/test'
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
  let passed = 0

  await page.goto(fixture.href)
  for (const width of [2560, 375]) {
    let baseline
    let frameBaseline
    await page.setViewportSize({
      width: width,
      height: width === 375 ? 812 : 1440
    })
    for (const path of paths) {
      await page.mouse.move(width - 20, 790)
      await evaluate(`window.layoutTest.show('${path}')`)
      await page.locator('.page-header').first().waitFor()
      const headers = await evaluate(metrics)
      assert.ok(headers.length, path)
      assert.equal(
        await evaluate('window.layoutTest.check().passed'),
        true,
        path
      )
      baseline ??= headers[0]
      const frames = await evaluate(screenFrames)
      assert.ok(frames.length, path)
      frameBaseline ??= frames[0]
      for (const frame of frames) {
        assert.equal(frame[0], '1px', path)
        assert.equal(frame[1], '16px', path)
        assert.notEqual(frame[2], 'none', path)
        assert.deepEqual(frame, frameBaseline, path)
      }
      for (const header of headers) {
        assert.equal(header.padding, '8px 16px', path)
        assert.equal(header.size, '22px', path)
        assert.equal(header.gap, '8px 12px', path)
        assert.deepEqual(header, baseline, path)
      }
      console.log(`PASS ${width}px shared header: ${path}`)
      passed++
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
    passed++
  }
})
