import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import { runInThisContext } from 'node:vm'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const source = readFileSync(
  new URL('../src/pages/UserEditor/index.tsx', import.meta.url),
  'utf8'
)
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX }
}).outputText

// Render the real page with controlled query responses, without a browser or API.
function renderEditor({
  id = '7',
  search = '',
  permissions = ['user_view'],
  users = {},
  roles = {}
} = {}) {
  const calls = {
    users: [],
    roles: [],
    retryUsers: 0,
    retryRoles: 0,
    form: null,
    navigations: []
  }
  const buttons = new Map()
  const usersQuery = {
    data: [{ id: 7, firstName: 'Иван' }],
    refetch: () => {
      calls.retryUsers++
    },
    ...users
  }
  const rolesQuery = {
    data: [],
    refetch: () => {
      calls.retryRoles++
    },
    ...roles
  }
  const mocks = {
    antd: {
      Result: ({ status, title, subTitle, extra }) =>
        React.createElement(
          'section',
          { 'data-status': status },
          title,
          subTitle,
          extra
        ),
      Alert: ({ title, action }) =>
        React.createElement('aside', null, title, action),
      Spin: ({ tip }) => React.createElement('div', { role: 'status' }, tip),
      Button: ({ children, onClick, loading }) => {
        buttons.set(children, onClick)
        return React.createElement(
          'button',
          { disabled: Boolean(loading) },
          children
        )
      }
    },
    'react-router-dom': {
      useParams: () => ({ id }),
      useLocation: () => ({ search }),
      useNavigate: () => (target) => calls.navigations.push(target)
    },
    '@hooks/useRole': {
      default: () => ({ hasPermission: (key) => permissions.includes(key) })
    },
    '@services/userService': {
      default: {
        useGetAllUsersQuery: (_, options) => {
          calls.users.push(options)
          return usersQuery
        }
      }
    },
    '@services/roleService': {
      default: {
        useGetAllRolesQuery: (_, options) => {
          calls.roles.push(options)
          return rolesQuery
        }
      }
    },
    '@routes/routePaths': { routePaths: { users: '/users' } },
    '@type/roles.type': {
      PermissionKeysType: { user_create: 'user_create', user_view: 'user_view' }
    },
    './UserEditorForm': {
      default: (props) => {
        calls.form = props
        return React.createElement('form', {
          'data-user': props.user?.id ?? 'new'
        })
      }
    }
  }
  const module = { exports: {} }
  const execute = runInThisContext(
    `(function(require, module, exports) { ${compiled} })`
  )
  execute((name) => mocks[name] ?? require(name), module, module.exports)
  const html = renderToStaticMarkup(React.createElement(module.exports.default))
  return { html, calls, buttons }
}

test('a direct user URL loads the form without navigation state', () => {
  const { calls, html } = renderEditor()
  assert.equal(calls.form.user.id, 7)
  assert.match(html, /data-user="7"/)
  assert.equal(calls.users[0].skip, false)
})

test('the exact URL id selects the user from the loaded list', () => {
  const { calls } = renderEditor({
    id: '12',
    users: { data: [{ id: 7 }, { id: 12 }] }
  })
  assert.equal(calls.form.user.id, 12)
})

test('a direct creation URL works with create permission and skips the users query', () => {
  const { calls, html } = renderEditor({
    id: 'new',
    permissions: ['user_create'],
    users: { data: undefined }
  })
  assert.match(html, /data-user="new"/)
  assert.equal(calls.users[0].skip, true)
})

test('missing permission shows access denied and skips both queries', () => {
  const { calls, html } = renderEditor({ permissions: [] })
  assert.match(html, /data-status="403"/)
  assert.equal(calls.form, null)
  assert.equal(calls.users[0].skip, true)
  assert.equal(calls.roles[0].skip, true)
})

test('an initial request displays loading instead of a missing user', () => {
  const { calls, html } = renderEditor({
    users: { data: undefined, isLoading: true }
  })
  assert.match(html, /Загрузка пользователя/)
  assert.equal(calls.form, null)
  assert.doesNotMatch(html, /data-status="404"/)
})

test('a failed initial request offers retry rather than a missing user', () => {
  const { calls, html, buttons } = renderEditor({
    users: { data: undefined, isError: true }
  })
  assert.match(html, /Не удалось загрузить/)
  assert.equal(calls.form, null)
  buttons.get('Повторить')()
  assert.equal(calls.retryUsers, 1)
  assert.equal(calls.retryRoles, 0)
})

test('roles can be retried without repeating the successful users request', () => {
  const { calls, buttons } = renderEditor({
    roles: { data: undefined, isError: true }
  })
  buttons.get('Повторить')()
  assert.equal(calls.retryUsers, 0)
  assert.equal(calls.retryRoles, 1)
})

test('an unknown id is reported only after a successful list request', () => {
  const { calls, html } = renderEditor({ id: '999' })
  assert.match(html, /data-status="404"/)
  assert.equal(calls.form, null)
})

test('a failed background refresh keeps the form rendered with cached data', () => {
  const { calls, html } = renderEditor({ users: { isError: true } })
  assert.equal(calls.form.user.id, 7)
  assert.match(html, /Не удалось обновить данные/)
  assert.match(html, /data-user="7"/)
})

test('returning from an unavailable user preserves list filters and page', () => {
  const search = '?search=ivan&role=2&page=3'
  const { calls, buttons } = renderEditor({ id: '999', search })
  buttons.get('К пользователям')()
  assert.deepEqual(calls.navigations, [{ pathname: '/users', search }])
})
