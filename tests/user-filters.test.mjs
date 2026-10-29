import assert from 'node:assert/strict'
import test from 'node:test'

import {
  filterUsers,
  getUsersPage,
  readUserFilters
} from '../src/pages/UsersPage/userFilters.ts'

const users = [
  {
    id: 12,
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    roles: [1, 2],
    blocked: false
  },
  {
    id: 23,
    firstName: 'Анна',
    lastName: 'Иванова',
    email: 'anna@example.com',
    roles: [2],
    blocked: true
  },
  {
    id: 34,
    firstName: 'Пётр',
    lastName: 'Сидоров',
    email: 'petr@example.com',
    roles: [],
    blocked: false
  }
]
const defaults = { search: '', status: 'all' }
const ids = (filters) =>
  filterUsers(users, { ...defaults, ...filters }).map((user) => user.id)

test('empty filters retain the original list order', () => {
  assert.deepEqual(ids({}), [12, 23, 34])
})

test('search ignores case and leading or repeated spaces', () => {
  assert.deepEqual(ids({ search: '  ПЕТРОВ   иван  ' }), [12])
})

test('search finds email and identifier', () => {
  assert.deepEqual(ids({ search: 'anna@example.com' }), [23])
  assert.deepEqual(ids({ search: '34' }), [34])
})

test('all search terms must match the same user', () => {
  assert.deepEqual(ids({ search: 'Анна Сидоров' }), [])
})

test('role filter includes users with multiple roles', () => {
  assert.deepEqual(ids({ roleId: 2 }), [12, 23])
})

test('role filter excludes users with no roles', () => {
  assert.deepEqual(ids({ roleId: 1 }), [12])
})

test('status filter distinguishes blocked and non-blocked users', () => {
  assert.deepEqual(ids({ status: 'blocked' }), [23])
  assert.deepEqual(ids({ status: 'active' }), [12, 34])
})

test('search, role and status filters apply together', () => {
  assert.deepEqual(ids({ search: 'ИВАН', roleId: 2, status: 'blocked' }), [23])
  assert.deepEqual(ids({ search: 'Пётр', roleId: 2, status: 'active' }), [])
})

test('whitespace search does not hide users', () => {
  assert.deepEqual(ids({ search: '   ' }), [12, 23, 34])
})

test('filters do not mutate users or their assigned roles', () => {
  const before = structuredClone(users)
  ids({ roleId: 2, search: 'Иван' })
  assert.deepEqual(users, before)
})

test('URL restores all filter values', () => {
  assert.deepEqual(
    readUserFilters(new URLSearchParams('search=Иван&role=2&status=blocked')),
    {
      search: 'Иван',
      roleId: 2,
      status: 'blocked'
    }
  )
})

test('unknown status and invalid role values use neutral defaults', () => {
  for (const role of [
    'abc',
    '-1',
    '1.5',
    'Infinity',
    '1e2',
    ' ',
    '9007199254740992'
  ]) {
    assert.deepEqual(
      readUserFilters(new URLSearchParams({ role, status: 'unknown' })),
      {
        search: '',
        roleId: undefined,
        status: 'all'
      }
    )
  }
})

test('a valid page is restored from URL', () => {
  assert.equal(getUsersPage(new URLSearchParams('page=3'), 100, 20), 3)
})

test('invalid pages fall back to the first page', () => {
  for (const page of ['abc', '-2', '0', '1.5', 'Infinity']) {
    assert.equal(getUsersPage(new URLSearchParams({ page }), 100, 20), 1)
  }
})

test('shrinking results clamps the page to the last available page', () => {
  assert.equal(getUsersPage(new URLSearchParams('page=4'), 21, 20), 2)
  assert.equal(getUsersPage(new URLSearchParams('page=4'), 0, 20), 1)
})
