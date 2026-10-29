import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

const fixture = process.argv[2]
if (!fixture)
  throw new Error('Pass the path to the offline layout.html fixture')
const base = ['--session', 'isp-menu-regression']
function run(...args) {
  const result = spawnSync('agent-browser', [...base, ...args], {
    encoding: 'utf8'
  })
  if (result.status !== 0) throw new Error(result.stdout + result.stderr)
  return result.stdout
}
function evaluate(expression) {
  return JSON.parse(run('--json', 'eval', expression)).data.result
}
const popupCount = `[...document.querySelectorAll('.ant-menu-submenu-popup')].filter(element => getComputedStyle(element).display !== 'none' && getComputedStyle(element).visibility !== 'hidden' && element.getBoundingClientRect().height > 0).length`
const group = '.layout-menu > .ant-menu-submenu'
const groupTitle = `${group} > .ant-menu-submenu-title`
const route = `document.querySelector('[data-testid="test-route"]').textContent`
function waitFor(expression) {
  const deadline = Date.now() + 5000
  while (Date.now() < deadline) {
    if (evaluate(expression)) return
    run('wait', '100')
  }
  throw new Error(`Timed out waiting for: ${expression}`)
}
function show(path, collapsed, width = 1440) {
  run('set', 'viewport', String(width), '900')
  run('mouse', 'move', String(width - 20), '880')
  run(
    'eval',
    `localStorage.setItem('menu', ${JSON.stringify(String(collapsed))}); window.layoutTest.show(${JSON.stringify(path)})`
  )
  run('wait', '.admin-shell')
  waitFor(`${route} === ${JSON.stringify(path)}`)
}
let passed = 0
function check(name, verify) {
  verify()
  console.log(`PASS ${name}`)
  passed++
}

try {
  run('--allow-file-access', 'open', pathToFileURL(fixture).href)
  check(
    'direct desktop entry does not open a popup in a collapsed sidebar',
    () => {
      show('/users/new', true)
      assert.equal(evaluate(popupCount), 0)
    }
  )
  check('direct mobile entry does not cover the user form', () => {
    show('/users/new', true, 375)
    assert.equal(evaluate(popupCount), 0)
  })
  check('responsive collapse also closes the initially expanded group', () => {
    show('/roles/1', false, 375)
    waitFor(
      `document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
    )
    assert.equal(evaluate(popupCount), 0)
  })
  check('hover still opens the collapsed menu', () => {
    show('/users/new', true)
    run('hover', groupTitle)
    waitFor(`${popupCount} === 1`)
  })
  check('selecting a leaf navigates and closes the popup', () => {
    run('click', '.ant-menu-submenu-popup [role="menuitem"]:last-child')
    waitFor(`${route} === '/roles'`)
    waitFor(`${popupCount} === 0`)
  })
  check('expanding the sidebar reveals the active route group', () => {
    run('click', '.layout-sider__toggle')
    waitFor(
      `!document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
    )
    waitFor(
      `document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
    )
    assert.match(
      evaluate(
        `document.querySelector('.layout-menu .ant-menu-item-selected').textContent`
      ),
      /Роли/
    )
  })
  check('manual group closing is preserved', () => {
    run('click', groupTitle)
    waitFor(
      `!document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
    )
  })
  check(
    'router navigation reveals the new active group in expanded mode',
    () => {
      run('eval', `window.navigateInFixture('/modules')`)
      waitFor(`${route} === '/modules'`)
      run('eval', `window.navigateInFixture('/roles/1')`)
      waitFor(`${route} === '/roles/1'`)
      waitFor(
        `document.querySelector('${group}').classList.contains('ant-menu-submenu-open')`
      )
    }
  )
  check('collapsing the sidebar closes its open group', () => {
    run('click', '.layout-sider__toggle')
    waitFor(
      `document.querySelector('.layout-sider').classList.contains('ant-layout-sider-collapsed')`
    )
    waitFor(`${popupCount} === 0`)
  })
  check('keyboard can open the collapsed submenu', () => {
    run('mouse', 'move', '1420', '880')
    run('focus', groupTitle)
    run('press', 'ArrowRight')
    waitFor(`${popupCount} === 1`)
  })
  check('Escape closes the keyboard-opened submenu', () => {
    run('press', 'Escape')
    waitFor(`${popupCount} === 0`)
  })
  check('clicking the already selected route also closes its popup', () => {
    run('mouse', 'move', '1420', '880')
    show('/roles', true)
    run('hover', groupTitle)
    waitFor(`${popupCount} === 1`)
    run('click', '.ant-menu-submenu-popup [role="menuitem"]:last-child')
    waitFor(`${popupCount} === 0`)
    assert.equal(evaluate(route), '/roles')
  })
  check('a new hover opens the menu again after selection', () => {
    run('mouse', 'move', '1420', '880')
    run('hover', groupTitle)
    waitFor(`${popupCount} === 1`)
  })
  console.log(`${passed} offline menu checks passed`)
} finally {
  run('close')
}
