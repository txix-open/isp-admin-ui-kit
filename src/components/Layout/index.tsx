import { ConfigProvider, Layout, Spin } from 'antd'
import { findRouteWithParents, Layout as LayoutUi } from 'isp-ui-kit'
import { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { localStorageKeys } from '@constants/localStorageKeys.ts'

import Header from '@widgets/Header'

import {
  CustomMenuItemType,
  LayoutComponentPropsType
} from '@components/Layout/layout.type.ts'
import { menuConfig } from '@components/Layout/menu-config.tsx'

import { LocalStorage } from '@utils/localStorageUtils.ts'

import { useAppDispatch, useAppSelector } from '@hooks/redux.ts'
import useRole from '@hooks/useRole.tsx'

import { fetchProfile, fetchUI } from '@stores/redusers/ActionCreators.ts'
import { StateProfileStatus } from '@stores/redusers/ProfileSlice.ts'

import { routePaths } from '@routes/routePaths.ts'

import './layout.scss'

const { Content } = Layout
const { LayoutMenu, LayoutSider } = LayoutUi

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
  const { theme } = useContext(ConfigProvider.ConfigContext)

  const userToken = LocalStorage.get(localStorageKeys.USER_TOKEN)

  const onHideMenuItem = (permission: string | string[]) => {
    if (Array.isArray(permission)) {
      const result = permission.reduce((acc, currentValue: string) => {
        const hasPermissionFunc = hasPermission(currentValue)
        return hasPermissionFunc || acc
      }, false)
      return result ? '' : 'hide-item'
    }
    return hasPermission(permission) ? '' : 'hide-item'
  }

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
        icon: route.icon
      }

      if (route.children && route.children.length > 0) {
        menuItem.children = getCustomMenuItems(route.children)
      }

      return menuItem
    })
  }

  const customMenuItems: CustomMenuItemType[] =
    getCustomMenuItems(customRouters)

  const resultMenuConfig = [...menuConfig(firstName), ...customMenuItems]

  useEffect(() => {
    ConfigProvider.config({
      holderRender: (children) => (
        <ConfigProvider prefixCls="static" theme={theme}>
          {children}
        </ConfigProvider>
      )
    })
  }, [theme])
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
    if (routeWithParents && routeWithParents.route.route) {
      navigate(routeWithParents.route.route)
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
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </section>
  )
}

export default LayoutComponent
