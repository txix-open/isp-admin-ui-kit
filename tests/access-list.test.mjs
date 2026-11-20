import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getAccessMethodKey,
  updateAccessMethodChanges
} from '../src/utils/accessListUtils.ts'

const path = 'kkd-address-service/enrich_single'
const allowed = { method: path, httpMethod: '', value: true }

test('an empty and an omitted HTTP method identify the same access', () => {
  assert.equal(getAccessMethodKey(path, ''), getAccessMethodKey(path))
  assert.notEqual(getAccessMethodKey(path, ''), getAccessMethodKey(path, 'GET'))
  assert.notEqual(
    getAccessMethodKey(path, 'GET'),
    getAccessMethodKey(path, 'POST')
  )
})

test('a route without httpMethod can revoke the backend access with httpMethod empty', () => {
  const methods = [allowed]
  const before = structuredClone(methods)
  assert.deepEqual(
    updateAccessMethodChanges(methods, [], [{ method: path, value: false }]),
    [{ method: path, httpMethod: '', value: false }]
  )
  assert.deepEqual(methods, before)
})

test('checking the backend method again cancels its pending revocation', () => {
  assert.deepEqual(
    updateAccessMethodChanges(
      [allowed],
      [{ method: path, httpMethod: '', value: false }],
      [{ method: path, value: true }]
    ),
    []
  )
})

test('group changes match legacy methods and preserve changes outside the group', () => {
  const unrelated = { method: '/other', httpMethod: 'POST', value: true }
  const previous = [unrelated, { method: path, value: false }]
  const before = structuredClone(previous)
  assert.deepEqual(
    updateAccessMethodChanges([allowed], previous, [
      { method: path, value: false },
      { method: '/new', httpMethod: 'GET', value: false }
    ]),
    [unrelated, { method: path, httpMethod: '', value: false }]
  )
  assert.deepEqual(previous, before)
})

test('enabling and reverting a new route keeps no redundant changes', () => {
  const change = { method: path, httpMethod: 'GET', value: true }
  const enabled = updateAccessMethodChanges([], [], [change])
  assert.deepEqual(enabled, [change])
  assert.deepEqual(
    updateAccessMethodChanges([], enabled, [{ ...change, value: false }]),
    []
  )
})

test('HTTP methods on the same path remain independent', () => {
  const get = { method: path, httpMethod: 'GET', value: true }
  const post = { method: path, httpMethod: 'POST', value: false }
  assert.deepEqual(
    updateAccessMethodChanges(
      [get, post],
      [],
      [
        { ...get, value: false },
        { ...post, value: true }
      ]
    ),
    [
      { ...get, value: false },
      { ...post, value: true }
    ]
  )
})
