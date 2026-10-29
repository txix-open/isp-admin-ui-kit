import { expect, test } from '@playwright/test'
import assert from 'node:assert/strict'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test('menu', async ({ page }) => {
  test.setTimeout(90_000)
  const evaluate = (expression) => page.evaluate(expression)

  const popupCount = `[...document.querySelectorAll('.ant-menu-submenu-popup')].filter(element => getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden' && element.getBoundingClientRect().height > 0).length`
  const group = '.layout-menu > .ant-menu-submenu'
  const groupTitle = `${group} > .ant-menu-submenu-title`
  const route = `document.querySelector('[data-testid="test-route"]').textContent`
  const waitFor = async (expression) => {
    await expect
      .poll(() => evaluate(expression), { timeout: 5000 })
      .toBeTruthy()
  }
  async function show(path, collapsed, width = 1440) {
    await page.setViewportSize({
      width: width,
      height: 900
    })
    await page.mouse.move(width - 20, 880)
    await evaluate(
      `localStorage.setItem('menu', ${JSON.stringify(String(collapsed))}); window.layoutTest.show(${JSON.stringify(path)})`
    )
    await page.locator('.admin-shell').first().waitFor()
    await waitFor(`${route} === ${JSON.stringify(path)}`)
  }

  const check = (name, verify) => test.step(name, verify)

  await page.goto(fixture.href)
  await check(
    'direct desktop entry does not open a popup in a collapsed sidebar',
    async () => {
      await show('/users/new', true)
      assert.equal(await evaluate(popupCount), 0)
    }
  )
  await check('direct mobile entry does not cover the user form', async () => {
    await show('/users/new', true, 375)
    assert.equal(await evaluate(popupCount), 0)
  })
  await check(
    'responsive collapse also closes the initially expanded group',
    async () => {
      await show('/roles/1', false, 375)
      await waitFor(
        `document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
      )
      assert.equal(await evaluate(popupCount), 0)
    }
  )
  await check('hover still opens the collapsed menu', async () => {
    await show('/users/new', true)
    await page.locator(groupTitle).hover()
    await waitFor(`${popupCount} === 1`)
  })
  await check('selecting a leaf navigates and closes the popup', async () => {
    await page
      .locator('.ant-menu-submenu-popup [role="menuitem"]:last-child')
      .click()
    await waitFor(`${route} === '/roles'`)
    await waitFor(`${popupCount} === 0`)
  })
  await check(
    'expanding the sidebar reveals the active route group',
    async () => {
      await page.locator('.layout-sider__toggle').click()
      await waitFor(
        `!document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
      )
      await waitFor(
        `document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
      )
      assert.match(
        await evaluate(
          `document.querySelector('.layout-menu .ant-menu-item-selected').textContent`
        ),
        /Роли/
      )
    }
  )
  await check('manual group closing is preserved', async () => {
    await page.locator(groupTitle).click()
    await waitFor(
      `!document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
    )
  })
  await check(
    'router navigation reveals the new active group in expanded mode',
    async () => {
      await evaluate(`window.navigateInFixture('/modules')`)
      await waitFor(`${route} === '/modules'`)
      await evaluate(`window.navigateInFixture('/roles/1')`)
      await waitFor(`${route} === '/roles/1'`)
      await waitFor(
        `document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
      )
    }
  )
  await check('collapsing the sidebar closes its open group', async () => {
    await page.locator('.layout-sider__toggle').click()
    await waitFor(
      `document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
    )
    await waitFor(`${popupCount} === 0`)
  })
  await check('keyboard can open the collapsed submenu', async () => {
    await page.mouse.move(1420, 880)
    await page.locator(groupTitle).focus()
    await page.keyboard.press('ArrowRight')
    await waitFor(`${popupCount} === 1`)
  })
  await check('Escape closes the keyboard-opened submenu', async () => {
    await page.keyboard.press('Escape')
    await waitFor(`${popupCount} === 0`)
  })
  await check(
    'clicking the already selected route also closes its popup',
    async () => {
      await page.mouse.move(1420, 880)
      await show('/roles', true)
      await page.locator(groupTitle).hover()
      await waitFor(`${popupCount} === 1`)
      await page
        .locator('.ant-menu-submenu-popup [role="menuitem"]:last-child')
        .click()
      await waitFor(`${popupCount} === 0`)
      assert.equal(await evaluate(route), '/roles')
    }
  )
  await check('a new hover opens the menu again after selection', async () => {
    await page.mouse.move(1420, 880)
    await page.locator(groupTitle).hover()
    await waitFor(`${popupCount} === 1`)
  })
})
