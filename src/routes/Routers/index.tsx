import { Spin } from 'antd'
import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'

import LayoutComponent from '@components/Layout'

//  Составная часть основной страницы, поэтому без lazy
import Configurations from '@pages/ConfigurationsPage'
import Connections from '@pages/ConnectionsPage'
import ErrorWrapperPage from '@pages/ErrorWrapperPage'

import PrivateRoute from '@routes/PrivateRoute'
import { routePaths } from '@routes/routePaths.ts'

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

const Routers = () => {
  return (
    <Routes>
      <Route element={<PrivateRoute />}>
        <Route path={routePaths.home} element={<LayoutComponent />}>
          <Route
            index
            element={
              <Suspense fallback={<Spin />}>
                <Navigate to={routePaths.modules} replace={true} />
              </Suspense>
            }
          />
          <Route
            path={`${routePaths.profile}`}
            element={
              <Suspense fallback={<Spin />}>
                <ProfilePage />
              </Suspense>
            }
          />
          <Route
            path={routePaths.users}
            element={
              <Suspense fallback={<Spin />}>
                <UsersPage />
              </Suspense>
            }
          />
          <Route
            path={`${routePaths.users}/:id`}
            element={
              <Suspense fallback={<Spin />}>
                <UserEditor />
              </Suspense>
            }
          />
          <Route
            path={routePaths.roles}
            element={
              <Suspense fallback={<Spin />}>
                <RolesPage />
              </Suspense>
            }
          >
            <Route
              path=":id"
              element={
                <Suspense fallback={<Spin />}>
                  <RolesPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path={routePaths.applicationsGroup}
            element={
              <Suspense fallback={<Spin />}>
                <ApplicationsPage />
              </Suspense>
            }
          >
            <Route
              path=":id"
              element={
                <Suspense fallback={<Spin />}>
                  <ApplicationsPage />
                </Suspense>
              }
            >
              <Route
                path={routePaths.application}
                element={
                  <Suspense fallback={<Spin />}>
                    <ApplicationsPage />
                  </Suspense>
                }
              >
                <Route
                  path=":appId"
                  element={
                    <Suspense fallback={<Spin />}>
                      <ApplicationsPage />
                    </Suspense>
                  }
                />
              </Route>
            </Route>
          </Route>

          <Route
            path={routePaths.sessions}
            element={
              <Suspense fallback={<Spin />}>
                <SessionsPage />
              </Suspense>
            }
          />
          <Route
            path={routePaths.securityLog}
            element={
              <Suspense fallback={<Spin />}>
                <SecurityLogPage />
              </Suspense>
            }
          />
          <Route
            path={`${routePaths.appAccess}`}
            element={
              <Suspense fallback={<Spin />}>
                <AppAccessPage />
              </Suspense>
            }
          >
            <Route
              path=":id"
              element={
                <Suspense fallback={<Spin />}>
                  <AppAccessPage />
                </Suspense>
              }
            />
          </Route>
          <Route
            path={`:moduleId/${routePaths.configEditor}/:id`}
            element={
              <Suspense fallback={<Spin />}>
                <ConfigurationEditorPage />
              </Suspense>
            }
          ></Route>
          <Route
            path={routePaths.modules}
            element={
              <Suspense fallback={<Spin />}>
                <ModulesPage />
              </Suspense>
            }
          >
            <Route path=":id">
              <Route
                path={routePaths.configurations}
                element={
                  <Suspense fallback={<Spin />}>
                    <Configurations />
                  </Suspense>
                }
              >
                <Route
                  path={routePaths.allVersions}
                  element={
                    <Suspense fallback={<Spin />}>
                      <AllVersionsPage />
                    </Suspense>
                  }
                />
              </Route>
              <Route
                path={routePaths.connections}
                element={
                  <Suspense fallback={<Spin />}>
                    <Connections />
                  </Suspense>
                }
              />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route
        path={routePaths.error}
        element={
          <Suspense fallback={<Spin />}>
            <ErrorWrapperPage />
          </Suspense>
        }
      />
      <Route
        path={routePaths.login}
        element={
          <Suspense fallback={<Spin />}>
            <LoginPage />
          </Suspense>
        }
      />
      <Route
        path={routePaths.notFound}
        element={
          <Suspense fallback={<Spin />}>
            <NotFound />
          </Suspense>
        }
      />
    </Routes>
  )
}

export default Routers
