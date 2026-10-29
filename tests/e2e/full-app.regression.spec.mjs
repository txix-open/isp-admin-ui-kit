import { expect, test } from '@playwright/test'

const fixture = new URL('../../build/playwright/layout.html', import.meta.url)

test.describe.configure({ mode: 'parallel' })

test.beforeEach(async ({ page }) => {
  await page.goto(fixture.href)
})

const show = (page, path, options = {}) =>
  page.evaluate(
    ([path, options]) => window.layoutTest.showApp(path, options),
    [path, options]
  )

async function openRoute(page, path, heading, expectedPath = path) {
  const errors = []
  const recordError = (error) => errors.push(error.message)
  page.on('pageerror', recordError)
  try {
    await show(page, path)
    await expect(
      page.getByRole('heading', { level: 1, name: heading, exact: true })
    ).toBeVisible()
    await expect(page.getByTestId('test-route')).toHaveText(expectedPath)
    expect(errors).toEqual([])
  } finally {
    page.off('pageerror', recordError)
  }
}

const routes = [
  ['/', 'Модули', '/modules'],
  ['/users', 'Пользователи'],
  ['/users/7', 'Пользователь с длинной фамилией Александр'],
  ['/users/new', 'Новый пользователь'],
  ['/roles', 'Роли пользователей'],
  ['/roles/1', 'Роли пользователей'],
  ['/roles/new', 'Роли пользователей'],
  ['/application_groups', 'Приложения и группы'],
  ['/application_groups/1', 'Приложения и группы'],
  ['/application_groups/1/application', 'Приложения и группы'],
  ['/application_groups/1/application/101', 'Приложения и группы'],
  ['/sessions', 'Пользовательские сессии'],
  ['/security_logs', 'Журнал событий'],
  ['/app_access', 'Доступы приложений'],
  ['/modules', 'Модули'],
  ['/modules/1/configurations', 'Модули'],
  ['/modules/1/configurations/7/all_versions', 'Модули'],
  ['/modules/1/connections', 'Модули'],
  ['/modules/relations', 'Карта связей модулей'],
  ['/variables', 'Переменные'],
  ['/variables/new', 'Новая переменная'],
  ['/variables/APP_TIMEOUT', 'APP_TIMEOUT'],
  ['/login', 'Вход']
]

for (const [path, heading, expectedPath] of routes) {
  test(`router renders ${path}`, async ({ page }) => {
    await openRoute(page, path, heading, expectedPath)
  })
}

for (const path of ['/error', '/missing-route']) {
  test(`recovery screen returns home from ${path}`, async ({ page }) => {
    await show(page, path)
    await page.getByRole('button', { name: 'На главную' }).click()
    await expect(page.getByTestId('test-route')).toHaveText('/modules')
    await expect(
      page.getByRole('heading', { level: 1, name: 'Модули' })
    ).toBeVisible()
  })
}

test('password login restores the protected URL and logout clears the session', async ({
  page
}) => {
  await show(page, '/profile?from=offline', { authenticated: false })
  const route = page.getByTestId('test-route')
  await expect(route).toHaveText('/login')
  await expect
    .poll(() => page.evaluate(() => sessionStorage.getItem('prevRoute')))
    .toBe('/profile?from=offline')
  await page.locator('#login-email').fill('operator')
  await page.locator('#login-password').fill('fixture-password')
  await page.getByRole('button', { name: /Войти$/ }).click()
  await expect(route).toHaveText('/profile')
  await expect(route).toHaveAttribute('data-search', '?from=offline')
  expect(await page.evaluate(() => localStorage.getItem('USER_TOKEN'))).toBe(
    'fixture-session'
  )
  await page
    .locator('.profile-page__logout-row')
    .getByRole('button', { name: /Выйти$/ })
    .click()
  await page
    .locator('.ant-popconfirm')
    .getByRole('button', { name: 'Выйти', exact: true })
    .click()
  await expect(route).toHaveText('/login')
  expect(
    await page.evaluate(() => localStorage.getItem('USER_TOKEN'))
  ).toBeNull()
})

test('OAuth callback exchanges the code once and records the OAuth session', async ({
  page
}) => {
  await show(page, '/sudir?code=fixture-code', { authenticated: false })
  await expect(page.getByTestId('test-route')).toHaveText('/modules')
  expect(await page.evaluate(() => window.layoutFixtures.authCalls)).toEqual([
    {
      path: '/api/admin/auth/login_with_oauth',
      body: { authCode: 'fixture-code', clientName: 'fixture-client' }
    }
  ])
  expect(await page.evaluate(() => localStorage.getItem('OAUTH_LOGIN'))).toBe(
    'true'
  )
})

test('OAuth provider error offers a return to login without exchanging a code', async ({
  page
}) => {
  await show(page, '/sudir?code=ignored&error=access_denied', {
    authenticated: false
  })
  await expect(page.getByText('Не удалось войти в аккаунт')).toBeVisible()
  expect(await page.evaluate(() => window.layoutFixtures.authCalls)).toEqual([])
  await page.getByRole('button', { name: 'На страницу входа' }).click()
  await expect(page.getByTestId('test-route')).toHaveText('/login')
})

test('profile filters permissions and changes the theme', async ({ page }) => {
  await page.evaluate(() => {
    window.layoutFixtures.profile = {
      firstName: 'Тест',
      permissions: ['module_view', 'profile_view'],
      roleNames: ['Оператор']
    }
  })
  await openRoute(page, '/profile', 'Профиль')
  await page
    .getByRole('textbox', { name: 'Поиск по разрешениям' })
    .fill('module')
  await expect(page.locator('.profile-page__permission-list li')).toHaveText([
    'module_view'
  ])
  await page.getByText('Тёмная', { exact: true }).click()
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('theme')))
    .toBe('true')
  await page.getByRole('button', { name: 'Сменить пароль' }).click()
  const dialog = page.getByRole('dialog', { name: 'Сменить пароль' })
  await dialog.getByRole('button', { name: 'Изменить пароль' }).click()
  await expect(
    dialog.getByText('Поле не может быть пустым').first()
  ).toBeVisible()
  await dialog.getByRole('button', { name: 'Отмена' }).click()
  await expect(dialog).toBeHidden()
})

test('Git connection selection loads its file list and names the deleted object', async ({
  page
}) => {
  await page.evaluate(() => {
    Object.assign(window.layoutFixtures.mutationResults, {
      gitDir: { data: ['service.json'] },
      gitCommits: { data: [{ hash: 'fixture-hash', tags: [] }] },
      gitFile: { data: { timeout: 30 } },
      gitMerge: { data: {} }
    })
  })
  await openRoute(page, '/git_configuration', 'Git конфигурация')
  await page
    .locator('.git-configuration-page__selects')
    .getByRole('combobox')
    .click()
  await page.getByText('Конфигурации сервиса', { exact: true }).last().click()
  await expect(
    page.getByText('https://example.test/configurations.git', { exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(() => window.layoutFixtures.mutationCalls)
  ).toContainEqual({
    name: 'gitDir',
    args: { credentialsName: 'Конфигурации сервиса' }
  })
  const fileForm = page.locator('.git-configuration-page__file-form')
  await fileForm.getByRole('combobox').nth(0).click()
  await page.getByText('service.json', { exact: true }).last().click()
  await fileForm.getByRole('combobox').nth(1).click()
  await page.getByText('Тестовый модуль 1', { exact: true }).last().click()
  await page.getByRole('button', { name: 'Отобразить' }).click()
  await page.getByRole('button', { name: /Применить$/ }).click()
  await expect(
    page.getByText('Конфигурация успешно применена', { exact: true })
  ).toBeVisible()
  expect(
    await page.evaluate(
      () =>
        window.layoutFixtures.mutationCalls.find(
          ({ name }) => name === 'gitMerge'
        )?.args
    )
  ).toEqual({
    config: { timeout: 30 },
    module: 'Тестовый модуль 1'
  })
  await page.getByRole('button', { name: 'Удалить GIT' }).click()
  const confirmation = page.locator('.ant-popconfirm')
  await expect(confirmation).toContainText(
    'Удалить подключение Git «Конфигурации сервиса»?'
  )
  await confirmation.getByRole('button', { name: 'Отмена' }).click()
  await expect(confirmation).toBeHidden()
  expect(
    await page.evaluate(() =>
      window.layoutFixtures.mutationCalls.some(
        ({ name }) => name === 'deleteGit'
      )
    )
  ).toBe(false)
})

test('real configuration form preserves a renamed key after failure and saves on retry', async ({
  page
}) => {
  await page.evaluate(() => {
    const fixtures = window.layoutFixtures
    fixtures.moduleConfigs = {
      1: [
        {
          id: '7',
          moduleId: '1',
          name: 'Подключение',
          version: 1,
          active: true,
          valid: true,
          data: { options: { oldKey: 'old value' } }
        }
      ]
    }
    fixtures.configurationSchema = {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          title: 'Параметры',
          additionalProperties: { type: 'string' }
        }
      }
    }
    fixtures.mutationResults.saveConfig = {
      error: { response: { status: 500 } }
    }
  })
  await show(page, '/1/configEditor/7')
  const save = page.getByRole('button', { name: 'Сохранить и выйти' })
  await expect(save).toBeDisabled()
  await page.getByText('Форма', { exact: true }).click()
  const key = page.locator('.config-form__additional-key input')
  await key.fill('newKey')
  await key.press('Enter')
  const value = page.locator('.config-form__additional-value input')
  await value.fill('new value')
  await save.click()
  await expect(
    page.getByText('Ошибка обновления конфигурации', { exact: true })
  ).toBeVisible()
  await expect(key).toHaveValue('newKey')
  await expect(value).toHaveValue('new value')
  await expect(save).toBeEnabled()
  await page.evaluate(() => {
    const fixtures = window.layoutFixtures
    fixtures.mutationResults.saveConfig = {
      data: fixtures.mutationCalls.at(-1).args
    }
  })
  await save.click()
  await expect(page.getByTestId('test-route')).toHaveText(
    '/modules/1/configurations'
  )
  expect(
    await page.evaluate(() =>
      window.layoutFixtures.mutationCalls
        .filter(({ name }) => name === 'saveConfig')
        .map(({ args }) => args.data)
    )
  ).toEqual([
    { options: { newKey: 'new value' } },
    { options: { newKey: 'new value' } }
  ])
})

test('access filters preserve the draft and saving sends only changed routes', async ({
  page
}) => {
  await page.evaluate(() => {
    const fixtures = window.layoutFixtures
    fixtures.accessMethods = [
      { method: '/test/0', httpMethod: 'GET', value: true }
    ]
    fixtures.accessRoutes = {
      moduleEndpoints: {
        test: [
          { path: '/test/0', httpMethod: 'GET' },
          { path: '/test/1', httpMethod: 'GET' }
        ]
      }
    }
    fixtures.mutationResults.saveAccess = { data: {} }
  })
  await openRoute(page, '/app_access/101', 'Доступы приложений')
  await page.getByRole('textbox', { name: 'Найти метод' }).fill('/test/1')
  await page.getByRole('button', { name: 'Разрешить все', exact: true }).click()
  const save = page.getByRole('button', {
    name: /Сохранить изменения$/
  })
  await expect(save).toBeEnabled()
  await page.getByRole('textbox', { name: 'Найти метод' }).clear()
  await save.click()
  const dialog = page.getByRole('dialog', {
    name: 'Сохранить изменения доступа?'
  })
  await expect(dialog).toContainText('/test/1')
  await dialog
    .getByRole('button', { name: 'Подтвердить изменения', exact: true })
    .click()
  await expect(dialog).toBeHidden()
  expect(
    await page.evaluate(
      () =>
        window.layoutFixtures.mutationCalls.find(
          ({ name }) => name === 'saveAccess'
        )?.args
    )
  ).toEqual({
    appId: 101,
    methods: [{ method: '/test/1', httpMethod: 'GET', value: true }]
  })
})

test('Swagger reports invalid data and can retry the local specification', async ({
  page
}) => {
  await page.evaluate(() => {
    const fixtures = window.layoutFixtures
    fixtures.modules[0].status = [{ endpoints: [{ path: '/test/swagger' }] }]
    fixtures.swaggerSpec = '{broken'
  })
  await openRoute(page, '/modules/1/swagger', 'Тестовый модуль 1')
  await expect(
    page.getByText('Не удалось прочитать спецификацию', { exact: true })
  ).toBeVisible()
  await page.getByRole('button', { name: 'Повторить' }).click()
  expect(await page.evaluate(() => window.layoutFixtures.retried)).toBe(
    'swagger'
  )
  await page.evaluate(() => {
    window.layoutFixtures.swaggerSpec = {
      openapi: '3.0.0',
      info: { version: '1.2.3' },
      paths: { '/test': { get: {} } }
    }
    window.layoutTest.showApp('/modules/1/swagger')
  })
  await expect(page.getByText('v1.2.3', { exact: true })).toBeVisible()
  await expect(page.getByText('Методов: 1', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('region', { name: 'Документация API' })
  ).toBeVisible()
})

test('configuration code protects invalid JSON and shares a valid draft across modes', async ({
  page
}) => {
  await openRoute(page, '/1/configEditor/7', 'Тестовая конфигурация')
  await page.getByText('Редактор кода', { exact: true }).click()
  const code = page.getByRole('textbox', { name: 'JSON-код конфигурации' })
  await code.fill('{')
  await expect(
    page.getByText('Некорректный JSON', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Сохранить и выйти' })
  ).toBeDisabled()
  await expect(
    page.getByRole('radio', { name: 'JSON', exact: true })
  ).toBeDisabled()
  await code.fill('{"timeout":30}')
  await expect(
    page.getByRole('button', { name: 'Сохранить и выйти' })
  ).toBeEnabled()
  await page.getByText('JSON', { exact: true }).click()
  await expect(
    page.getByRole('region', { name: 'Дерево конфигурации' })
  ).toContainText('timeout')
  await page.getByRole('button', { name: /Назад$/ }).click()
  const dialog = page.getByRole('dialog', {
    name: 'Есть несохранённые изменения'
  })
  await dialog
    .getByRole('button', { name: 'Продолжить редактирование' })
    .click()
  await expect(dialog).toBeHidden()
  await expect(
    page.getByRole('region', { name: 'Дерево конфигурации' })
  ).toContainText('timeout')
  await page.getByRole('button', { name: /Назад$/ }).click()
  await dialog.getByRole('button', { name: 'Выйти без сохранения' }).click()
  await expect(page.getByTestId('test-route')).toHaveText(
    '/modules/1/configurations'
  )
})

for (const [path, field, value, mutation, fieldName, destination] of [
  [
    '/users/7?role=1',
    'Имя',
    'Обновлённое имя',
    'updateUser',
    'firstName',
    '/users'
  ],
  [
    '/variables/APP_TIMEOUT?name=APP',
    'Значение',
    '45',
    'updateVariable',
    'value',
    '/variables'
  ]
]) {
  test(`saving ${path} sends the changed value and preserves the list filter`, async ({
    page
  }) => {
    await page.evaluate((mutation) => {
      window.layoutFixtures.mutationResults[mutation] = { data: {} }
    }, mutation)
    await show(page, path)
    const save = page.getByRole('button', { name: /Сохранить изменения$/ })
    await expect(save).toBeDisabled()
    await page.getByRole('textbox', { name: field, exact: true }).fill(value)
    await save.click()
    const route = page.getByTestId('test-route')
    await expect(route).toHaveText(destination)
    await expect(route).toHaveAttribute('data-search', '?' + path.split('?')[1])
    expect(
      await page.evaluate(
        ([mutation, fieldName]) =>
          window.layoutFixtures.mutationCalls.find(
            ({ name }) => name === mutation
          )?.args[fieldName],
        [mutation, fieldName]
      )
    ).toBe(value)
  })
}

test('failed OAuth exchange keeps the user signed out', async ({ page }) => {
  await page.evaluate(() => {
    window.layoutFixtures.authFailures = {
      '/api/admin/auth/login_with_oauth': 401
    }
  })
  await show(page, '/sudir?code=expired', { authenticated: false })
  await expect(
    page.getByText('Не удалось войти в аккаунт', { exact: true })
  ).toBeVisible()
  await expect(page.getByTestId('test-route')).toHaveText('/sudir')
  expect(
    await page.evaluate(() => localStorage.getItem('USER_TOKEN'))
  ).toBeNull()
  expect(
    await page.evaluate(() => window.layoutFixtures.authCalls.length)
  ).toBe(1)
})

test('custom route opens only when its required module is active', async ({
  page
}) => {
  await page.evaluate(() => {
    window.layoutFixtures.customRoute = true
  })
  await show(page, '/custom')
  await expect(
    page.getByText('Недостаточно модулей', { exact: true })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Раздел приложения' })
  ).toHaveCount(0)

  await page.evaluate(() => {
    window.layoutFixtures.modules.push({
      id: 999,
      name: 'fixture-module',
      active: true
    })
    window.layoutTest.showApp('/custom')
  })
  await expect(
    page.getByRole('heading', { name: 'Раздел приложения' })
  ).toBeVisible()
  await expect(page.getByTestId('test-route')).toHaveText('/custom')
})
