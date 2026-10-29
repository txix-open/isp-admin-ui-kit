import { configureStore } from '@reduxjs/toolkit'
import { createApi } from '@reduxjs/toolkit/query'
import axios from 'axios'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)

// Real Axios interceptors and RTK Query; the adapter rejects locally, without HTTP.
function setup(status = 500, code) {
  const messages = []
  const timers = new Map()
  let timerId = 0
  const browser = { location: { href: '/modules/relations' } }
  const storage = new Map()
  const mocks = {
    antd: { message: { error: (content) => messages.push(content) } },
    '@constants/localStorageKeys': {
      localStorageKeys: { HEADER_NAME: 'header', USER_TOKEN: 'user' },
      sessionStorageKeys: { PREV_ROUTE: 'previous' }
    },
    '@utils/configUtils': { getConfigProperty: () => 'test' },
    '@utils/localStorageUtils': {
      LocalStorage: {
        get: (key) => (key === 'header' ? 'X-TEST-AUTH' : 'test'),
        remove: () => {}
      }
    },
    '@utils/routeUtils': { getCleanPath: (path) => path },
    '@routes/routePaths': { routePaths: { login: '/login' } }
  }
  function load(file) {
    const source = readFileSync(
      new URL(`../src/${file}`, import.meta.url),
      'utf8'
    ).replaceAll('import.meta.env.VITE_APP_TOKEN', "'test'")
    const compiled = ts.transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX
      }
    }).outputText
    const exports = {}
    new Function(
      'require',
      'exports',
      'window',
      'sessionStorage',
      'setTimeout',
      'clearTimeout',
      compiled
    )(
      (name) => mocks[name] ?? require(name),
      exports,
      browser,
      {
        getItem: (key) => storage.get(key),
        setItem: (key, value) => storage.set(key, value)
      },
      (callback) => {
        const id = ++timerId
        timers.set(id, callback)
        return id
      },
      (id) => timers.delete(id)
    )
    return exports
  }
  const notifications = load('utils/apiErrorNotifications.ts')
  mocks['@utils/apiErrorNotifications'] = notifications
  mocks['./apiErrorNotifications'] = notifications
  const { apiService } = load('services/apiService.ts')
  mocks['@services/apiService'] = { apiService }
  const response = status
    ? {
        status,
        statusText: 'Failure',
        data: { errorCode: '0' },
        headers: {},
        config: {}
      }
    : undefined
  const error = new axios.AxiosError(
    'Test failure',
    code,
    undefined,
    undefined,
    response
  )
  apiService.defaults.adapter = () => Promise.reject(error)
  const flush = () => {
    for (const callback of [...timers.values()]) callback()
    timers.clear()
  }
  return { ...notifications, messages, flush, error, apiService, browser, load }
}

for (const status of [400, 403, 404, 409, 500, 503, null]) {
  test(`one local notification for status ${status ?? 'network error'}`, async () => {
    const context = setup(status)
    await context.apiService.post('/test').catch((error) => {
      context.notifyApiError(error, 'Не удалось обновить данные')
      context.notifyApiError(error, 'Вторая ошибка')
    })
    context.flush()
    assert.deepEqual(context.messages, ['Не удалось обновить данные'])
  })
}

test('a request without a local handler gets one fallback', async () => {
  const context = setup()
  await context.apiService.post('/test').catch(() => {})
  context.flush()
  context.notifyApiError(context.error, 'Поздний обработчик')
  assert.deepEqual(context.messages, [
    'Внутренняя ошибка сервиса, попробуйте повторить запрос'
  ])
})

for (const kind of ['query', 'mutation']) {
  test(`RTK ${kind} unwrap preserves one notification through the interceptor and baseQuery`, async () => {
    const context = setup()
    const { axiosBaseQuery } = context.load('utils/apiUtils.ts')
    const api = createApi({
      reducerPath: 'testApi',
      baseQuery: axiosBaseQuery(),
      endpoints: (builder) => ({
        update: builder[kind]({ query: () => ({ url: '/test' }) })
      })
    })
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer },
      middleware: (getDefault) =>
        getDefault({ serializableCheck: false }).concat(api.middleware)
    })
    try {
      await store
        .dispatch(api.endpoints.update.initiate())
        .unwrap()
        .catch((error) => context.notifyApiError(error, 'Ошибка обновления'))
      context.flush()
      assert.deepEqual(context.messages, ['Ошибка обновления'])
    } finally {
      store.dispatch(api.util.resetApiState())
    }
  })
}

test('independent failures with the same text are not hidden', () => {
  const context = setup()
  context.notifyApiError(Object.freeze({}), 'Ошибка')
  context.notifyApiError(Object.freeze({}), 'Ошибка')
  assert.deepEqual(context.messages, ['Ошибка', 'Ошибка'])
})

test('field or modal handling cancels the fallback', async () => {
  const context = setup(400)
  await context.apiService.post('/test').catch(context.ignoreApiError)
  context.flush()
  assert.deepEqual(context.messages, [])
})

test('canceled requests remain silent', async () => {
  const context = setup(null, 'ERR_CANCELED')
  await context.apiService
    .post('/test')
    .catch((error) => context.notifyApiError(error, 'Ошибка'))
  context.flush()
  assert.deepEqual(context.messages, [])
})

test('parallel 401 failures produce one session notification and no local duplicates', async () => {
  const context = setup(401)
  context.apiService.defaults.adapter = () =>
    Promise.reject(
      new axios.AxiosError('Unauthorized', undefined, undefined, undefined, {
        status: 401
      })
    )
  await Promise.all(
    [1, 2].map(() =>
      context.apiService
        .post('/test')
        .catch((error) => context.notifyApiError(error, 'Ошибка метода'))
    )
  )
  context.flush()
  assert.deepEqual(context.messages, ['Ваша сессия истекла'])
  assert.equal(context.browser.location.href, '/login')
})

test('known variable validation uses a field error without an extra popup', async () => {
  const context = setup(400)
  context.error.response.data.errorCode = '2007'
  const fields = []
  const { handleVariableApiError } = context.load('utils/variableUtils.ts')
  await context.apiService.post('/test').catch((error) =>
    handleVariableApiError(error, 'Ошибка', {
      setError: (...args) => fields.push(args)
    })
  )
  context.flush()
  assert.equal(fields.length, 1)
  assert.deepEqual(context.messages, [])
})

test('unknown variable errors still receive one fallback', async () => {
  const context = setup(400)
  const { handleVariableApiError } = context.load('utils/variableUtils.ts')
  await context.apiService
    .post('/test')
    .catch((error) =>
      handleVariableApiError(error, 'Не удалось сохранить переменную')
    )
  context.flush()
  assert.deepEqual(context.messages, ['Не удалось сохранить переменную'])
})

for (const [code, expected] of [
  [undefined, 'Не удалось подключиться к сервису'],
  ['ECONNABORTED', 'Сервис не ответил вовремя. Попробуйте повторить запрос']
]) {
  test(`network fallback: ${code ?? 'connection failure'}`, async () => {
    const context = setup(null, code)
    await context.apiService.post('/test').catch(() => {})
    context.flush()
    assert.deepEqual(context.messages, [expected])
  })
}
