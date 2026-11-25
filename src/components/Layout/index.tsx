import { MenuOutlined } from '@ant-design/icons'
import { Button, Drawer, Layout, Spin } from 'antd'
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

import { filterMenuByPermissions } from '@components/Layout/filter-menu'
import {
  CustomMenuItemType,
  LayoutComponentPropsType
} from '@components/Layout/layout.type'
import { menuConfig } from '@components/Layout/menu-config'
import UnsavedChangesProvider from '@components/UnsavedChangesProvider'

import { LocalStorage } from '@utils/localStorageUtils'

import { useAppDispatch, useAppSelector } from '@hooks/redux'
import { useMobileWorkspace } from '@hooks/useMobileWorkspace'
import useRole from '@hooks/useRole'

import { fetchProfile, fetchUI } from '@stores/redusers/ActionCreators'
import { StateProfileStatus } from '@stores/redusers/ProfileSlice'

import ModuleGuard from '@routes/ModuleGuard'
import { routePaths } from '@routes/routePaths'

import './layout.scss'

const { Content } = Layout
const smallScreenQuery = '(max-width: 991px)'

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
      permissionMode: route.permissionMode,
      visibilityMode: route.visibilityMode,
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
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (window.matchMedia(smallScreenQuery).matches) return true
    return LocalStorage.get('menu') ?? true
  })
  const isMobile = useMobileWorkspace()
  const [menuOpen, setMenuOpen] = useState(false)
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

  const resultMenuConfig = useMemo(
    () => [...menuConfig(firstName), ...getCustomMenuItems(customRouters)],
    [firstName, customRouters]
  )

  const visibleMenuConfig = filterMenuByPermissions(
    resultMenuConfig,
    hasPermission
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

  useEffect(() => {
    const smallScreen = window.matchMedia(smallScreenQuery)
    const collapseOnSmallScreen = () => {
      if (smallScreen.matches) setCollapsed(true)
    }
    collapseOnSmallScreen()
    smallScreen.addEventListener('change', collapseOnSmallScreen)
    return () =>
      smallScreen.removeEventListener('change', collapseOnSmallScreen)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [isMobile, location.pathname])

  const handleItemChange = ({ key }: { key: string }) => {
    const route = findRouteWithParents(key, resultMenuConfig)?.route.route
    const path = Array.isArray(route) ? route[0] : route
    if (typeof path === 'string') {
      setMenuOpen(false)
      navigate(path)
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

  const renderMenu = (inlineCollapsed: boolean) => (
    <>
      <Header collapsed={inlineCollapsed} />
      <LayoutMenu
        inlineCollapsed={inlineCollapsed}
        onHideMenuItem={() => false}
        currentPath={location.pathname}
        menuConfig={visibleMenuConfig}
        onClickItem={handleItemChange}
      />
    </>
  )

  return (
    <section className="admin-shell">
      <Layout className="layout" data-cy="homePage">
        {isMobile ? (
          <Drawer
            placement="left"
            size="min(300px, 100vw)"
            title="Навигация"
            className="admin-mobile-navigation"
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
          >
            {renderMenu(false)}
          </Drawer>
        ) : (
          <LayoutSider
            collapsed={collapsed}
            onCollapse={handleCollapsedChange}
            style={{ height: '100%' }}
          >
            {renderMenu(collapsed)}
          </LayoutSider>
        )}
        <Layout className="site-layout">
          {isMobile && (
            <div className="admin-mobile-toolbar">
              <Button
                icon={<MenuOutlined aria-hidden />}
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(true)}
              >
                Меню
              </Button>
            </div>
          )}
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

const GuardedLayout = (props: LayoutComponentPropsType) => (
  <UnsavedChangesProvider>
    <LayoutComponent {...props} />
  </UnsavedChangesProvider>
)

export default GuardedLayout
