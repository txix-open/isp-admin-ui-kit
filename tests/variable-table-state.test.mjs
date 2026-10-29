import assert from 'node:assert/strict'
import test from 'node:test'

import {
  matchesVariableFilters,
  readVariableTableState
} from '../src/components/VariablesComponents/VariablesTable/variableTableState.ts'

test('URL restores filters, sorting and page', () => {
  assert.deepEqual(
    readVariableTableState(
      new URLSearchParams('page=2&name=APP&value=30&sort=name&order=ascend')
    ),
    { page: 2, name: 'APP', value: '30', sort: 'name', order: 'ascend' }
  )
})

test('invalid pages and unsupported sort fields fall back safely', () => {
  for (const page of ['', '-1', '1.5', 'NaN', 'Infinity', '9007199254740992']) {
    const state = readVariableTableState(
      new URLSearchParams({ page, sort: 'value', order: 'invalid' })
    )
    assert.equal(state.page, 1)
    assert.equal(state.sort, undefined)
    assert.equal(state.order, null)
  }
})

test('filters combine case-insensitive name and text value searches', () => {
  assert.equal(
    matchesVariableFilters(
      { name: 'APP_TIMEOUT', type: 'TEXT', value: '30 seconds' },
      { name: 'app', value: 'SECONDS' }
    ),
    true
  )
  assert.equal(
    matchesVariableFilters(
      { name: 'OTHER', type: 'TEXT', value: '30 seconds' },
      { name: 'app', value: 'seconds' }
    ),
    false
  )
})

test('secret values never participate in value filtering', () => {
  const secret = { name: 'API_KEY', type: 'SECRET', value: 'hidden-value' }
  assert.equal(matchesVariableFilters(secret, { name: 'api', value: '' }), true)
  assert.equal(
    matchesVariableFilters(secret, { name: '', value: 'hidden' }),
    false
  )
})
