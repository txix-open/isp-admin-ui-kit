import { Spin } from 'antd'
import { ComponentType, lazy, Suspense } from 'react'
import { RouteObject, Navigate } from 'react-router-dom'

import LayoutComponent from '@components/Layout'

//  Составная часть основной страницы, поэтому без lazy
import Configurations from '@pages/ConfigurationsPage'
import Connections from '@pages/ConnectionsPage'
import ErrorWrapperPage from '@pages/ErrorWrapperPage'

import PrivateRoute from '@routes/PrivateRoute'
import { generateCustomRoutes } from '@routes/customRoutes.tsx'
import { routePaths } from '@routes/routePaths.ts'

// Ленивые импорты
const LoginPage = lazy(() => import('@pages/LoginPage'))
const ProfilePage = lazy(() => import('@pages/ProfilePage'))
const UsersPage = lazy(() => import('@pages/UsersPage'))
const RolesPage = lazy(() => import('@pages/RolesPage'))
const UserEditor = lazy(() => import('src/pages/UserEditor'))
const SessionsPage = lazy(() => import('@pages/SessionsPage'))
const SecurityLogPage = lazy(() => import('@pages/SecurityLogPage'))
const AppAccessPage = lazy(() => import('@pages/AppAccessPage'))
const ModulesPage = lazy(() => import('@pages/ModulesPage'))
const ApplicationsPage = lazy(() => import('@pages/ApplicationsPage'))
const AllVersionsPage = lazy(() => import('@pages/AllVersionsPage'))
const ConfigurationEditorPage = lazy(
  () => import('@pages/ConfigurationEditorPage')
)
const NotFound = lazy(() => import('@pages/NotFound'))
const VariablesPage = lazy(() => import('@pages/VariablesPage'))
const VariableEditor = lazy(() => import('@pages/VariableEditor'))

const lazyElement = (Component: ComponentType) => (
  <Suspense fallback={<Spin />}>
    <Component />
  </Suspense>
)

export const getRoutesConfig = (customRouters: any[]): RouteObject[] => {
  return [
    {
      element: <PrivateRoute />,
      children: [
        {
          path: routePaths.home,
          element: <LayoutComponent customRouters={customRouters} />,
          children: [
            {
              index: true,
              element: <Navigate to={routePaths.modules} replace />
            },
            {
              path: routePaths.profile,
              element: lazyElement(ProfilePage)
            },
            {
              path: routePaths.users,
              element: lazyElement(UsersPage)
            },
            {
              path: `${routePaths.users}/:id`,
              element: lazyElement(UserEditor)
            },
            {
              path: routePaths.roles,
              element: lazyElement(RolesPage),
              children: [
                {
                  path: ':id',
                  element: lazyElement(RolesPage)
                }
              ]
            },
            {
              path: routePaths.applicationsGroup,
              element: lazyElement(ApplicationsPage),
              children: [
                {
                  path: ':id',
                  element: lazyElement(ApplicationsPage),
                  children: [
                    {
                      path: routePaths.application,
                      element: lazyElement(ApplicationsPage),
                      children: [
                        {
                          path: ':appId',
                          element: lazyElement(ApplicationsPage)
                        }
                      ]
                    }
                  ]
                }
              ]
            },
            {
              path: routePaths.sessions,
              element: lazyElement(SessionsPage)
            },
            {
              path: routePaths.securityLog,
              element: lazyElement(SecurityLogPage)
            },
            {
              path: routePaths.appAccess,
              element: lazyElement(AppAccessPage),
              children: [
                {
                  path: ':id',
                  element: lazyElement(AppAccessPage)
                }
              ]
            },
            {
              path: `:moduleId/${routePaths.configEditor}/:id`,
              element: lazyElement(ConfigurationEditorPage)
            },
            {
              path: routePaths.modules,
              element: lazyElement(ModulesPage),
              children: [
                {
                  path: ':id',
                  children: [
                    {
                      path: routePaths.configurations,
                      element: lazyElement(Configurations),
                      children: [
                        {
                          path: routePaths.allVersions,
                          element: lazyElement(AllVersionsPage)
                        }
                      ]
                    },
                    {
                      path: routePaths.connections,
                      element: lazyElement(Connections)
                    }
                  ]
                }
              ]
            },
            {
              path: routePaths.variables,
              element: lazyElement(VariablesPage)
            },
            {
              path: `${routePaths.variables}/:id`,
              element: lazyElement(VariableEditor)
            },
            ...generateCustomRoutes(customRouters)
          ]
        }
      ]
    },
    {
      path: routePaths.error,
      element: lazyElement(ErrorWrapperPage)
    },
    {
      path: routePaths.login,
      element: lazyElement(LoginPage)
    },
    {
      path: routePaths.notFound,
      element: lazyElement(NotFound)
    }
  ]
}
