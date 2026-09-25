import assert from 'node:assert/strict'
import test from 'node:test'

import { filterMenuByPermissions } from '../src/components/Layout/filter-menu.ts'

const item = (key, permissions, children, options = {}) => ({
  key,
  label: key,
  permissions,
  ...options,
  ...(children ? { children } : {})
})
const filter = (items, granted) =>
  filterMenuByPermissions(items, (permission) => granted.includes(permission))

test('legacy items still accept any one permission by default', () => {
  const menu = [item('legacy', ['read', 'edit'])]
  assert.deepEqual(filter(menu, ['read']), menu)
  assert.deepEqual(filter(menu, ['edit']), menu)
  assert.deepEqual(filter(menu, []), [])
})

test('legacy parents keep their own permission gate and any semantics', () => {
  const child = item('child', ['child_view', 'child_edit'])
  const parent = item('parent', ['parent_view', 'parent_edit'], [child])
  assert.deepEqual(filter([parent], ['child_view']), [])
  assert.deepEqual(filter([parent], ['parent_edit', 'child_view']), [parent])
  assert.deepEqual(filter([parent], ['parent_view']), [
    { ...parent, children: [] }
  ])
})

test('a parent can require all its own rights without changing child defaults', () => {
  const child = item('child', ['child_view', 'child_edit'])
  const parent = item('parent', ['read', 'edit'], [child], {
    permissionMode: 'all'
  })
  assert.deepEqual(filter([parent], ['read', 'child_view']), [])
  assert.deepEqual(filter([parent], ['read', 'edit', 'child_view']), [parent])
})

test('children visibility hides empty groups, including groups without children', () => {
  assert.deepEqual(
    filter(
      [
        item('empty', ['read'], [], { visibilityMode: 'children' }),
        item('missing', ['read'], undefined, { visibilityMode: 'children' })
      ],
      ['read']
    ),
    []
  )
})

test('a standalone item requires both permissions, in either order', () => {
  const menu = [
    item('git', ['git_configuration_view', 'module_view'], undefined, {
      permissionMode: 'all'
    })
  ]
  assert.deepEqual(filter(menu, []), [])
  assert.deepEqual(filter(menu, ['git_configuration_view']), [])
  assert.deepEqual(filter(menu, ['module_view']), [])
  assert.deepEqual(
    filter(menu, ['module_view', 'git_configuration_view']),
    menu
  )
})

test('a parent remains when one child is available, regardless of its aggregate permissions', () => {
  const users = item('users', ['user_view'])
  const roles = item('roles', ['role_view'])
  const parent = item(
    'management',
    ['user_view', 'role_view'],
    [users, roles],
    { visibilityMode: 'children' }
  )
  assert.deepEqual(filter([parent], ['user_view']), [
    { ...parent, children: [users] }
  ])
  assert.deepEqual(filter([parent], ['role_view']), [
    { ...parent, children: [roles] }
  ])
})

test('a child also requires all its permissions; partial access hides its parent', () => {
  const child = item(
    'git',
    ['git_configuration_view', 'module_view'],
    undefined,
    { permissionMode: 'all' }
  )
  const parent = item('settings', ['git_configuration_view'], [child], {
    visibilityMode: 'children'
  })
  assert.deepEqual(filter([parent], ['git_configuration_view']), [])
  assert.deepEqual(filter([parent], ['module_view']), [])
  assert.deepEqual(
    filter([parent], ['git_configuration_view', 'module_view']),
    [parent]
  )
})

test('empty groups disappear even when their own permissions are granted', () => {
  const parent = item(
    'settings',
    ['parent_view'],
    [item('child', ['child_view'])],
    { visibilityMode: 'children' }
  )
  assert.deepEqual(filter([parent], ['parent_view']), [])
})

test('nested groups retain only accessible descendants without mutating the config', () => {
  const child = item('child', ['read', 'edit'], undefined, {
    permissionMode: 'all'
  })
  const nested = item('nested', [], [child, item('hidden', ['other'])], {
    visibilityMode: 'children'
  })
  const parent = item('parent', [], [nested], { visibilityMode: 'children' })
  const before = structuredClone(parent)
  assert.deepEqual(filter([parent], ['read']), [])
  assert.deepEqual(filter([parent], ['read', 'edit']), [
    { ...parent, children: [{ ...nested, children: [child] }] }
  ])
  assert.deepEqual(parent, before)
})

test('empty children are treated as a leaf and empty permission lists remain hidden', () => {
  const leaf = item('leaf', ['read'], [])
  assert.deepEqual(filter([leaf], ['read']), [leaf])
  assert.deepEqual(filter([leaf], []), [])
  assert.deepEqual(filter([item('empty', [])], ['read']), [])
})

test('the supplied permission checker controls access and is re-evaluated', () => {
  const menu = [
    item('leaf', ['read', 'edit'], undefined, { permissionMode: 'all' })
  ]
  const excluded = new Set(['edit'])
  const hasPermission = (permission) => !excluded.has(permission)
  assert.deepEqual(filterMenuByPermissions(menu, hasPermission), [])
  excluded.clear()
  assert.deepEqual(filterMenuByPermissions(menu, hasPermission), menu)
})

test('legacy string permissions are still supported', () => {
  const menu = [item('leaf', 'read')]
  assert.deepEqual(filter(menu, []), [])
  assert.deepEqual(filter(menu, ['read']), menu)
})

test('legacy ALWAYS_VIEW is special only as a string permission', () => {
  assert.deepEqual(filter([item('always', 'ALWAYS_VIEW')], []), [
    item('always', 'ALWAYS_VIEW')
  ])
  assert.deepEqual(filter([item('not-always', ['ALWAYS_VIEW'])], []), [])
})
