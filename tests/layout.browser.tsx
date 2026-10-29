import { ConfigProvider } from 'antd'
import { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate
} from 'react-router-dom'

import LayoutComponent from '../src/components/Layout'
import { PageHeader } from '../src/components/PageLayout'
import { darkTheme, lightTheme } from '../src/constants/theme'

import AllVersionsPage from '../src/pages/AllVersionsPage'
import AppAccessPage from '../src/pages/AppAccessPage'
import ApplicationsPage from '../src/pages/ApplicationsPage'
import '../src/pages/ConfigurationEditorPage/configuration-editor-page.scss'
import ConnectionsPage from '../src/pages/ConnectionsPage'
import '../src/pages/GitConfigurationPage/git-configuration-page.scss'
import HomePage from '../src/pages/HomePage'
import ModuleRelationsPage from '../src/pages/ModuleRelationsPage'
import ModulesPage from '../src/pages/ModulesPage'
import '../src/pages/ModulesPage/modules-page.scss'
import '../src/pages/ProfilePage/profile-page.scss'
import RolesPage from '../src/pages/RolesPage'
import '../src/pages/RolesPage/roles-page.scss'
import SecurityLogPage from '../src/pages/SecurityLogPage'
import SessionsPage from '../src/pages/SessionsPage'
import SwaggerPage from '../src/pages/SwaggerPage'
import UserEditorForm from '../src/pages/UserEditor/UserEditorForm'
import UsersPage from '../src/pages/UsersPage'
import VariableEditor from '../src/pages/VariableEditor'
import VariablesPage from '../src/pages/VariablesPage'
import { PermissionKeysType } from '../src/type/roles.type'

import 'react-resizable/css/styles.css'
import 'simplebar-react/dist/simplebar.min.css'

const user = {
  id: 7,
  firstName: 'Александр',
  lastName: 'Пользователь с длинной фамилией',
  email: 'test@example.invalid',
  roles: [1],
  description: 'Тестовые данные',
  blocked: false,
  createdAt: '',
  updatedAt: '',
  password: '',
  roleId: 1,
  roleName: 'Оператор'
}
const role = {
  id: 1,
  name: 'Оператор тестового окружения',
  externalGroup: '',
  permissions: [PermissionKeysType.user_view],
  createdAt: '',
  updatedAt: '',
  description: '',
  immutable: false,
  exclusive: false
}
const permissions = Object.values(PermissionKeysType).map((key) => ({
  key,
  name: `Разрешение: ${key}`
}))
const items = Array.from({ length: 150 }, (_, index) => ({
  id: index + 1,
  name: `Тестовый модуль ${index + 1}`
}))
const variable = {
  name: 'APP_TIMEOUT',
  type: 'TEXT',
  value: '30',
  description: 'Время ожидания ответа',
  containsInConfigs: [],
  createdAt: '',
  updatedAt: ''
}

Object.assign(window, {
  layoutFixtures: {
    modules: items,
    versions: Array.from({ length: 45 }, (_, index) => ({
      id: String(index),
      configVersion: index + 1,
      createdAt: '2026-10-29T10:00:00Z',
      adminId: 7,
      data: {}
    })),
    accessMethods: Array.from({ length: 80 }, (_, index) => ({
      method: `/test/${index}`,
      httpMethod: 'GET',
      value: true
    })),
    accessRoutes: {
      moduleEndpoints: {
        test: Array.from({ length: 80 }, (_, index) => ({
          path: `/test/${index}`,
          httpMethod: 'GET'
        }))
      }
    },
    roles: [role],
    permissions,
    users: [user],
    queryStates: {},
    queryCalls: [],
    mutationCalls: [],
    mutationResults: {},
    applicationGroups: Array.from({ length: 80 }, (_, i) => ({
      id: i + 1,
      name: `Группа ${i + 1}`,
      description: 'Описание группы',
      createdAt: '',
      updatedAt: ''
    })),
    applications: Array.from({ length: 80 }, (_, i) => ({
      id: i + 101,
      applicationGroupId: i < 60 ? 1 : 2,
      name: `Приложение ${i + 1}`,
      description: 'Описание приложения',
      type: 'SYSTEM',
      createdAt: '',
      updatedAt: ''
    })),
    tokens: {
      101: Array.from({ length: 40 }, (_, i) => ({
        appId: 101,
        token: `fixture-token-${i}`,
        expireTime: -1,
        createdAt: '2026-10-29T10:00:00Z'
      }))
    },
    sessions: {
      totalCount: 23,
      items: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        userId: i ? '999' : '7',
        createdAt: '2026-10-29T10:00:00Z',
        expiredAt: '2026-10-30T10:00:00Z',
        status: 'ALLOWED'
      }))
    },
    logs: {
      totalCount: 23,
      items: Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        userId: i ? '999' : '7',
        createdAt: '2026-10-29T10:00:00Z',
        message:
          'Изменены права доступа\n' + 'Подробное описание события '.repeat(8)
      }))
    },
    variables: {
      ...Object.fromEntries(
        Array.from({ length: 65 }, (_, i) => [
          `VAR_${i}`,
          { ...variable, name: `VAR_${i}`, value: String(i) }
        ])
      ),
      APP_TIMEOUT: variable,
      API_KEY: { ...variable, name: 'API_KEY', type: 'SECRET', value: '' }
    }
  }
})

// Shared header under legacy page CSS; no legacy services are loaded.
const headerPreviews = [
  { path: 'profile', className: 'profile-page', title: 'Профиль' },
  {
    path: 'git',
    className: 'git-configuration-page',
    title: 'Git конфигурация'
  },
  {
    path: 'configuration',
    className: 'configuration-editor-page',
    title: 'Конфигурация'
  }
]

function DetailsScreen() {
  return (
    <div data-testid="details-scroll-content" style={{ height: 3600 }}>
      Длинное содержимое правой панели
    </div>
  )
}

function RouteProbe() {
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    Object.assign(window, { navigateInFixture: navigate })
  }, [navigate])
  return (
    <output data-testid="test-route" data-search={search} hidden>
      {pathname}
    </output>
  )
}

let renderVersion = 0
const root = createRoot(document.getElementById('root')!)
function show(
  path = '/modules/1/configurations',
  dark = false,
  remount = true
) {
  if (remount) renderVersion++
  root.render(
    <ConfigProvider theme={dark ? darkTheme : lightTheme}>
      <MemoryRouter
        key={`${path}-${dark}-${renderVersion}`}
        initialEntries={[path]}
      >
        <RouteProbe />
        <Routes>
          <Route path="/modules/:id/swagger" element={<SwaggerPage />} />
          <Route element={<LayoutComponent customRouters={[]} />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/app_access" element={<AppAccessPage />} />
            <Route path="/app_access/:id" element={<AppAccessPage />} />
            <Route path="/modules" element={<ModulesPage />}>
              <Route path=":id/configurations" element={<DetailsScreen />} />
              <Route path=":id/connections" element={<ConnectionsPage />} />
              <Route
                path=":id/configurations/:configId/all_versions"
                element={<AllVersionsPage />}
              />
            </Route>
            <Route path="/users" element={<UsersPage />} />
            <Route
              path="/users/new"
              element={<UserEditorForm roles={[role]} />}
            />
            <Route
              path="/users/7"
              element={<UserEditorForm user={user} roles={[role]} />}
            />
            <Route path="/variables" element={<VariablesPage />} />
            {headerPreviews.map((page) => (
              <Route
                key={page.path}
                path={`/header-preview/${page.path}`}
                element={
                  <section className={page.className}>
                    <PageHeader
                      title={page.title}
                      description="Описание экрана"
                    />
                  </section>
                }
              />
            ))}
            <Route
              path="/modules/relations"
              element={<ModuleRelationsPage />}
            />
            <Route path="/application_groups" element={<ApplicationsPage />} />
            <Route
              path="/application_groups/:id"
              element={<ApplicationsPage />}
            />
            <Route
              path="/application_groups/:id/application/:appId"
              element={<ApplicationsPage />}
            />
            <Route path="/variables/:id" element={<VariableEditor />} />
            <Route path="/sessions" element={<SessionsPage />} />
            <Route path="/security_logs" element={<SecurityLogPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/:id" element={<RolesPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ConfigProvider>
  )
}

function metrics() {
  const rect = (selector: string) => {
    const element = document.querySelector(selector) as HTMLElement | null
    if (!element) return null
    const box = element.getBoundingClientRect()
    return {
      top: box.top,
      bottom: box.bottom,
      width: box.width,
      height: box.height,
      scrollHeight: element.scrollHeight,
      clientHeight: element.clientHeight,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth
    }
  }
  return {
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      height: document.documentElement.scrollHeight,
      width: document.documentElement.scrollWidth
    },
    shell: rect('.admin-shell'),
    column: rect('.column'),
    list: rect('.column__items .simplebar-content-wrapper'),
    details: rect('.modules-page__content'),
    form: rect('.user-editor__content__wrap'),
    header: rect('.user-editor__header'),
    editorScroll: rect('.user-editor__content'),
    roleForm: rect('.roles-content'),
    roleScroll: rect('.roles-content__permissions'),
    formColumns: document.querySelector('.user-editor__content__wrap')
      ? getComputedStyle(document.querySelector('.user-editor__content__wrap')!)
          .gridTemplateColumns
      : null
  }
}

Object.assign(window, { layoutTest: { show, metrics } })
show()
