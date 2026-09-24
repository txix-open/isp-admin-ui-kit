import { Layout, Spin } from 'antd'
import { findRouteWithParents, LayoutMenu, LayoutSider } from 'isp-ui-kit'
import { useEffect, useMemo, useState } from 'react'
import {
  Navigate,
  Outlet,
  matchPath,
  useLocation,
  useNavigate
} from 'react-router-dom'

import { localStorageKeys } from '@constants/localStorageKeys'

import Header from '@widgets/Header'

import {
  CustomMenuItemType,
  LayoutComponentPropsType
} from '@components/Layout/layout.type'
import { menuConfig } from '@components/Layout/menu-config'

import { LocalStorage } from '@utils/localStorageUtils'

import { useAppDispatch, useAppSelector } from '@hooks/redux'
import useRole from '@hooks/useRole'

import { fetchProfile, fetchUI } from '@stores/redusers/ActionCreators'
import { StateProfileStatus } from '@stores/redusers/ProfileSlice'

import ModuleGuard from '@routes/ModuleGuard'
import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './layout.scss'

const { Content } = Layout

const getCustomMenuItems = (
  routers: CustomMenuItemType[]
): CustomMenuItemType[] => {
  return routers.map((route) => {
    const menuItem: CustomMenuItemType = {
      label: route.label,
      key: route.key,
      route: route.route,
      className: route.className ? route.className : '',
      permissions: route.permissions,
      requiredModules: route.requiredModules,
      icon: route.icon
    }

    if (route.children && route.children.length > 0) {
      menuItem.children = getCustomMenuItems(route.children)
    }

    return menuItem
  })
}

const LayoutComponent = ({ customRouters }: LayoutComponentPropsType) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    LocalStorage.get('menu') === null ? true : LocalStorage.get('menu')
  )
  const [loading, setLoading] = useState(true)
  const dispatch = useAppDispatch()
  const {
    status,
    profile: { firstName }
  } = useAppSelector((state) => state.profileReducer)
  const location = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useRole()

  const userToken = LocalStorage.get(localStorageKeys.USER_TOKEN)

  const onHideMenuItem = (permission: string | string[]) => {
    if (permission === PermissionKeysType.ALWAYS_VIEW) {
      return false
    }
    if (Array.isArray(permission)) {
      return !permission.some((perm) => hasPermission(perm))
    }
    return !hasPermission(permission)
  }

  const resultMenuConfig = useMemo(
    () => [...menuConfig(firstName), ...getCustomMenuItems(customRouters)],
    [firstName, customRouters]
  )

  const activeRequiredModules = useMemo(() => {
    let staticMatch: string[] | null = null
    let patternMatch: string[] | null = null
    let prefixMatch: string[] | null = null

    const hasDynamicSegments = (pattern: string) =>
      pattern
        .split('/')
        .filter(Boolean)
        .some((segment) => segment === '*' || segment.startsWith(':'))

    const visit = (items: CustomMenuItemType[], inherited: string[]) => {
      for (const item of items) {
        const accumulated = Array.from(
          new Set([...inherited, ...(item.requiredModules || [])])
        )
        const paths = item.route
          ? Array.isArray(item.route)
            ? item.route
            : [item.route]
          : []

        for (const rawPath of paths) {
          if (!rawPath) {
            continue
          }

          const path = rawPath.startsWith('/') ? rawPath : `/${rawPath}`

          if (matchPath(path, location.pathname)) {
            if (staticMatch === null) {
              if (!hasDynamicSegments(path)) {
                staticMatch = accumulated
              } else if (patternMatch === null) {
                patternMatch = accumulated
              }
            }
          } else if (
            prefixMatch === null &&
            location.pathname.startsWith(`${path}/`)
          ) {
            prefixMatch = accumulated
          }
        }

        if (item.children && item.children.length > 0) {
          visit(item.children, accumulated)
        }
      }
    }

    visit(resultMenuConfig, [])

    return staticMatch ?? patternMatch ?? prefixMatch ?? []
  }, [location.pathname, resultMenuConfig])

  useEffect(() => {
    if (userToken && status === StateProfileStatus.notInit) {
      dispatch(fetchProfile())
      dispatch(fetchUI())
    }
  }, [userToken, status])

  useEffect(() => {
    if (
      status === StateProfileStatus.resolved ||
      status === StateProfileStatus.rejected
    ) {
      setLoading(false)
    }
  }, [status])

  const handleItemChange = ({ key }: { key: string }) => {
    const routeWithParents = findRouteWithParents(key, resultMenuConfig)
    const routePath = routeWithParents?.route.route

    if (Array.isArray(routePath)) {
      navigate(routePath[0])
      return
    }

    if (typeof routePath === 'string') {
      navigate(routePath)
    }
  }

  if (loading || status === StateProfileStatus.pending) {
    return <Spin size="large" fullscreen />
  }

  if (status === StateProfileStatus.rejected) {
    return <Navigate to={routePaths.error} replace />
  }
  const handleCollapsedChange = (value: boolean) => {
    LocalStorage.set('menu', value)
    setCollapsed(value)
  }

  return (
    <section>
      <Layout className="layout" data-cy="homePage">
        <LayoutSider collapsed={collapsed} onCollapse={handleCollapsedChange}>
          <Header collapsed={collapsed} />
          <LayoutMenu
            onHideMenuItem={onHideMenuItem}
            currentPath={location.pathname}
            menuConfig={resultMenuConfig}
            onClickItem={handleItemChange}
          />
        </LayoutSider>
        <Layout className="site-layout">
          <Content className="site-layout__content">
            {activeRequiredModules.length > 0 ? (
              <ModuleGuard requiredModules={activeRequiredModules}>
                <Outlet />
              </ModuleGuard>
            ) : (
              <Outlet />
            )}
          </Content>
        </Layout>
      </Layout>
    </section>
  )
}

export default LayoutComponent
