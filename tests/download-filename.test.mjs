import assert from 'node:assert/strict'
import test from 'node:test'

import { getDownloadFilename } from '../src/utils/downloadFilename.ts'

test('uses the server filename, including quoted names with semicolons', () => {
  assert.equal(
    getDownloadFilename('attachment; filename="users;2026.csv"', 'user.csv'),
    'users;2026.csv'
  )
  assert.equal(
    getDownloadFilename("attachment; filename='roles.csv'", 'role.csv'),
    'roles.csv'
  )
})

test('prefers a UTF-8 filename over the plain fallback', () => {
  assert.equal(
    getDownloadFilename(
      "attachment; filename=users.csv; filename*=UTF-8''%D0%A0%D0%BE%D0%BB%D0%B8.csv",
      'role.csv'
    ),
    'Роли.csv'
  )
})

test('handles absent, empty, and malformed filename headers', () => {
  assert.equal(getDownloadFilename(undefined, 'log.csv'), 'log.csv')
  assert.equal(getDownloadFilename('attachment', 'log.csv'), 'log.csv')
  assert.equal(
    getDownloadFilename('attachment; filename=""', 'log.csv'),
    'log.csv'
  )
  assert.equal(
    getDownloadFilename(
      "attachment; filename*=UTF-8''%ZZ; filename=logs.csv",
      'log.csv'
    ),
    'logs.csv'
  )
})
