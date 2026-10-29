import assert from 'node:assert/strict'
import test from 'node:test'

import { hasRoleChanges, hasUserChanges } from '../src/utils/formChanges.ts'

const user = {
  firstName: 'Иван',
  lastName: 'Иванов',
  email: 'ivan@example.com',
  description: '',
  roles: [2, 1]
}
const role = {
  name: 'Оператор',
  externalGroup: '',
  permissions: ['user_view', 'role_view']
}

test('unchanged user and role keep saving disabled', () => {
  assert.equal(hasUserChanges({ ...user }, user), false)
  assert.equal(hasRoleChanges({ ...role }, role), false)
})

test('removing and restoring a user role is not a change', () => {
  assert.equal(hasUserChanges({ ...user, roles: [1] }, user), true)
  assert.equal(hasUserChanges({ ...user, roles: [1, 2] }, user), false)
})

test('removing and restoring a permission is not a change', () => {
  assert.equal(
    hasRoleChanges({ ...role, permissions: ['role_view'] }, role),
    true
  )
  assert.equal(
    hasRoleChanges({ ...role, permissions: ['role_view', 'user_view'] }, role),
    false
  )
})

test('a different selection with the same size is a change', () => {
  assert.equal(hasUserChanges({ ...user, roles: [1, 3] }, user), true)
  assert.equal(
    hasRoleChanges(
      { ...role, permissions: ['user_view', 'user_update'] },
      role
    ),
    true
  )
})

test('each editable user text field can be changed and restored', () => {
  for (const field of [
    'firstName',
    'lastName',
    'email',
    'password',
    'description'
  ]) {
    assert.equal(
      hasUserChanges({ ...user, [field]: 'Изменено' }, user),
      true,
      field
    )
    assert.equal(
      hasUserChanges({ ...user, [field]: user[field] ?? '' }, user),
      false,
      field
    )
  }
})

test('each editable role text field can be changed and restored', () => {
  for (const field of ['name', 'externalGroup']) {
    assert.equal(
      hasRoleChanges({ ...role, [field]: 'Изменено' }, role),
      true,
      field
    )
    assert.equal(
      hasRoleChanges({ ...role, [field]: role[field] }, role),
      false,
      field
    )
  }
})

test('empty controls match missing optional defaults', () => {
  assert.equal(
    hasUserChanges({ description: '', password: '', roles: [] }, {}),
    false
  )
  assert.equal(
    hasRoleChanges({ externalGroup: '', permissions: [] }, {}),
    false
  )
})

test('reverting a selection does not hide other unsaved changes', () => {
  assert.equal(
    hasUserChanges({ ...user, roles: [1, 2], firstName: 'Пётр' }, user),
    true
  )
  assert.equal(
    hasRoleChanges(
      {
        ...role,
        permissions: [...role.permissions].reverse(),
        name: 'Администратор'
      },
      role
    ),
    true
  )
})

test('comparing selections does not reorder the form or original data', () => {
  const currentUser = { ...user, roles: [1, 2] }
  const currentRole = { ...role, permissions: [...role.permissions].reverse() }
  const before = structuredClone({ user, role, currentUser, currentRole })
  hasUserChanges(currentUser, user)
  hasRoleChanges(currentRole, role)
  assert.deepEqual({ user, role, currentUser, currentRole }, before)
})
