import { test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('module table ux', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const path = '/modules/1/configurations'
  const input = 'input[aria-label="Название конфигурации"]'
  const save = 'button[aria-label="Сохранить название"]'

  await page.goto(fixture.href)
  await page.locator('.page-header').first().waitFor()
  await evaluate(`(() => {
    const f=window.layoutFixtures;
    f.realModules=true;
    f.moduleConfigs={'1':[{id:'7',moduleId:'1',name:'Основная конфигурация',active:true,valid:true,version:1,updatedAt:'2026-10-29T10:00:00Z',data:{}},{id:'8',moduleId:'1',name:'Длинное название конфигурации '.repeat(20),active:false,valid:false,version:2,updatedAt:'2026-10-29T10:00:00Z',data:{}}]};
  })()`)
  for (const dark of [false, true])
    for (const width of [1440, 375]) {
      await page.setViewportSize({
        width: width,
        height: width === 375 ? 812 : 1000
      })
      await page.mouse.move(10, 790)
      await evaluate(
        `window.layoutFixtures.queryStates.configurations={};window.layoutTest.show('${path}',${dark})`
      )
      await page
        .locator('.active-configurations-table__name-button')
        .first()
        .waitFor()
      assert.equal(
        await evaluate(
          `document.querySelectorAll('.active-configurations-table').length`
        ),
        2
      )
      assert.deepEqual(
        await evaluate(
          `Array.from(document.querySelectorAll('.active-configurations-table__count')).map(e=>e.textContent)`
        ),
        ['1', '1']
      )
      await page
        .locator('.active-configurations-table__name-button >> nth=0')
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
        .locator(
          '.configuration-preview-modal .modal__footer button:has-text("Закрыть")'
        )
        .click()
      await page
        .locator('button[aria-label^="Переименовать конфигурацию"] >> nth=0')
        .click()
      await page.locator(input).first().waitFor()
      assert.equal(
        await evaluate(`document.querySelector('${save}').disabled`),
        true
      )
      await page.locator(input).fill('Новое название')
      assert.equal(
        await evaluate(`document.querySelector('${save}').disabled`),
        false
      )
      await page.locator(input).fill('Основная конфигурация')
      await page.keyboard.press('Enter')
      assert.equal(
        await evaluate(`document.querySelector('${save}').disabled`),
        true
      )
      assert.equal(
        await evaluate('window.layoutFixtures.mutationCalls.length'),
        0
      )
      await page.locator(input).fill('   ')
      assert.equal(
        await evaluate(`document.querySelector('${save}').disabled`),
        true
      )
      await page.locator(input).fill('Черновое название')
      await evaluate(
        `window.layoutFixtures.queryStates.configurations={isFetching:true};window.layoutTest.show('${path}',${dark},false)`
      )
      assert.equal(
        await evaluate(`document.querySelector('${input}').value`),
        'Черновое название'
      )
      assert.equal(
        await evaluate(`document.querySelector('${input}').disabled`),
        false
      )
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Обновление данных')`
        ),
        true
      )
      await evaluate(
        `window.layoutFixtures.queryStates.configurations={isError:true};window.layoutTest.show('${path}',${dark},false)`
      )
      assert.equal(
        await evaluate(
          `document.body.textContent.includes('Показаны ранее загруженные данные')`
        ),
        true
      )
      assert.equal(
        await evaluate(`document.querySelector('${input}').value`),
        'Черновое название'
      )
      await page.keyboard.press('Escape')
      assert.equal(await evaluate(`document.querySelector('${input}')`), null)
      assert.equal(
        await evaluate(
          `document.activeElement.getAttribute('aria-label')?.startsWith('Переименовать конфигурацию')`
        ),
        true
      )
      assert.equal(
        await evaluate(
          `Array.from(document.querySelectorAll('.ant-table-content')).every(e=>e.scrollWidth<=e.clientWidth+1)`
        ),
        true
      )
      assert.equal(await evaluate('window.layoutTest.check().passed'), true)
      console.log(
        `PASS ${dark ? 'dark' : 'light'} ${width}px: name preview, safe rename, keyboard cancel, draft survives refresh and error`
      )
    }
  await evaluate(
    `window.layoutFixtures.queryStates.configurations={currentData:undefined,isLoading:true,isFetching:true};window.layoutTest.show('${path}')`
  )
  await page.locator('.ant-spin-spinning').first().waitFor()
  assert.equal(
    await evaluate(
      `document.querySelectorAll('.active-configurations-table').length`
    ),
    2
  )
  assert.equal(
    await evaluate(
      `document.querySelectorAll('.active-configurations-table__count').length`
    ),
    0
  )
  await evaluate(
    `window.layoutFixtures.queryStates.configurations={currentData:undefined,isError:true};window.layoutTest.show('${path}',false,false)`
  )
  assert.equal(
    await evaluate(
      `document.querySelectorAll('.active-configurations-table').length`
    ),
    2
  )
  assert.equal(
    await evaluate(
      `document.body.textContent.includes('Данные конфигураций недоступны')`
    ),
    true
  )
  assert.equal(
    await evaluate(
      `document.body.textContent.includes('Других конфигураций пока нет')`
    ),
    false
  )
  await page.locator('.ant-alert button:has-text("Повторить")').click()
  assert.equal(
    await evaluate('window.layoutFixtures.retried'),
    'configurations'
  )
  await evaluate(
    `window.layoutFixtures.moduleConfigs['1']=[];window.layoutFixtures.queryStates.configurations={};window.layoutTest.show('${path}')`
  )
  assert.equal(
    await evaluate(
      `document.body.textContent.includes('Активная конфигурация пока не выбрана')`
    ),
    true
  )
  assert.equal(
    await evaluate(
      `document.body.textContent.includes('Других конфигураций пока нет')`
    ),
    true
  )
  assert.equal(await evaluate('window.layoutFixtures.mutationCalls.length'), 0)
  console.log(
    'PASS: loading, failed load with retry and true empty states are distinct; no mutations or network'
  )
})
