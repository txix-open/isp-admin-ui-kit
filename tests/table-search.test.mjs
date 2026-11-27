import assert from 'node:assert/strict'
import test from 'node:test'

import { buildTableSearchQuery } from '../src/utils/tableSearch.ts'

test('serializes text and numbers, and distinguishes selections from date ranges', () => {
  const from = '2026-11-17T00:00:00.000Z'
  const to = '2026-11-18T00:00:00.000Z'

  assert.deepEqual(
    buildTableSearchQuery(
      {
        userId: [1, 2],
        status: ['allowed'],
        id: [0],
        message: ['вход'],
        createdAt: [from, to]
      },
      ['createdAt'],
      ['userId', 'status']
    ),
    {
      userId: [1, 2],
      status: ['allowed'],
      id: 0,
      message: 'вход',
      createdAt: { from, to }
    }
  )
})

test('omits the query when all filters are cleared or incomplete', () => {
  assert.equal(
    buildTableSearchQuery(
      { userId: [], message: null, createdAt: ['2026-11-17T00:00:00.000Z'] },
      ['createdAt'],
      ['userId']
    ),
    undefined
  )
})
