import {
  AppstoreAddOutlined,
  FileProtectOutlined,
  ProductOutlined,
  ProfileOutlined
} from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ConfigProvider, Layout, Menu, Spin } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { localStorageKeys } from '@constants/localStorageKeys.ts'

import Header from '@widgets/Header'

import DefaultUser from '@components/Icons/DefaultUser.tsx'
import {
  LayoutComponentPropsType,
  MenuItemKeysType,
  MenuItemLabelsType,
  MenuItemType,
  menuKeys,
  MenuParentItemKeysType
} from '@components/Layout/layout.type.ts'

import { LocalStorage } from '@utils/localStorageUtils.ts'

import { useAppDispatch, useAppSelector } from '@hooks/redux.ts'
import useRole from '@hooks/useRole.tsx'

import { fetchProfile, fetchUI } from '@stores/redusers/ActionCreators.ts'
import { StateProfileStatus } from '@stores/redusers/ProfileSlice.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'
import { CustomMenuItemType } from '@type/app.type.ts'

import './layout.scss'

const { Content, Sider } = Layout

const LayoutComponent = ({ customRouters }: LayoutComponentPropsType) => {
  const [collapsed, setCollapsed] = useState<boolean>(
    LocalStorage.get('menu') === null ? true : LocalStorage.get('menu')
  )
  const [selectedMenuKeys, setSelectedMenuKeys] = useState<MenuItemKeysType[]>(
    []
  )
  const [openKeys, setOpenKeys] = useState<string[]>([])
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

  const hideItem = (
    permission: PermissionKeysType | PermissionKeysType[] | string[]
  ) => {
    if (Array.isArray(permission)) {
      const result = permission.reduce((acc, currentValue) => {
        const hasPermissionFunc = hasPermission(currentValue)
        return hasPermissionFunc || acc
      }, false)
      return result ? '' : 'hide-item'
    }
    return hasPermission(permission) ? '' : 'hide-item'
  }

  const getCustomMenuItems = (routers: CustomMenuItemType[]): MenuItemType[] => {
    return routers.map((route) => {
      const menuItem: MenuItemType = {
        label: route.label,
        key: route.key,
        className: hideItem(route.permissions),
        icon: route.icon,
      }

      if (route.children && route.children.length > 0) {
        menuItem.children = getCustomMenuItems(route.children)
      }

      return menuItem
    })
  }

  const customMenuItems: MenuItemType[] = getCustomMenuItems(customRouters)

  const menuItems: MenuItemType[] = [
    {
      label: firstName || '',
      key: MenuItemKeysType.profile,
      className: 'user-item',
      icon: <DefaultUser />
    },
    {
      label: MenuItemLabelsType.applications_group,
      key: MenuItemKeysType.applicationsGroup,
      className: hideItem([PermissionKeysType.read]),
      icon: <AppstoreAddOutlined />
    },
    {
      label: MenuItemLabelsType.appAccess,
      key: MenuItemKeysType.appAccess,
      className: hideItem([PermissionKeysType.read]),
      icon: <FileProtectOutlined />
    },
    {
      label: MenuItemLabelsType.modules,
      key: MenuItemKeysType.modules,
      className: hideItem(PermissionKeysType.read),
      icon: <ProductOutlined />
    },
    {
      label: MenuItemLabelsType.session_management,
      key: MenuParentItemKeysType.sessionManagement,
      className: hideItem([
        PermissionKeysType.user_view,
        PermissionKeysType.session_view,
        PermissionKeysType.role_view
      ]),
      icon: <ProfileOutlined />,
      children: [
        {
          label: MenuItemLabelsType.users,
          key: MenuItemKeysType.users,
          className: hideItem(PermissionKeysType.user_view)
        },
        {
          label: MenuItemLabelsType.sessions,
          key: MenuItemKeysType.sessions,
          className: hideItem(PermissionKeysType.session_view)
        },
        {
          label: MenuItemLabelsType.securityLog,
          key: MenuItemKeysType.securityLog,
          className: hideItem(PermissionKeysType.security_log_view)
        },
        {
          label: MenuItemLabelsType.roles,
          key: MenuItemKeysType.roles,
          className: hideItem(PermissionKeysType.role_view)
        }
      ]
    },
    ...customMenuItems
  ]

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

  useEffect(() => {
    const menuKey = location.pathname.split('/')[1] as MenuItemKeysType
    const selectedKey = selectedMenuKeys[0] || ''
    const menuItem = menuKeys[menuKey]

    if (menuKey !== selectedKey) {
      setSelectedMenuKeys([menuKey])
      if (selectedKey && menuItem) {
        setOpenKeys(menuItem.parent)
      }
    }
  }, [location.pathname])

  const handleCustomRoute = (key: string, routers: CustomMenuItemType[]): void => {
    const getRoute = () =>
      routers.find((route) => {
        if (route.children && route.children.length > 0) {
          handleCustomRoute(key, route.children)
        }
       return route.key === key
      })
    const route = getRoute()
    if (route) {
      navigate(route.path)
    }
  }

  const handlerOnClickMenu: MenuProps['onClick'] = ({ key }): void => {
    switch (key) {
      case MenuItemKeysType.profile: {
        navigate(routePaths.profile)
        break
      }
      case MenuItemKeysType.users:
        navigate(routePaths.users)
        break
      case MenuItemKeysType.sessions:
        navigate(routePaths.sessions)
        break
      case MenuItemKeysType.securityLog:
        navigate(routePaths.securityLog)
        break
      case MenuItemKeysType.appAccess:
        navigate(routePaths.appAccess)
        break
      case MenuItemKeysType.roles:
        navigate(routePaths.roles)
        break
      case MenuItemKeysType.modules:
        navigate(routePaths.modules)
        break
      case MenuItemKeysType.applicationsGroup:
        navigate(routePaths.applicationsGroup)
        break
      default:
        handleCustomRoute(key, customRouters)
        break
    }
  }

  if (loading || status === StateProfileStatus.pending) {
    return <Spin size="large" fullscreen />
  }

  if (status === StateProfileStatus.rejected) {
    return <Navigate to={routePaths.error} replace />
  }

  return (
    <section>
      <Layout className="layout" data-cy="homePage">
        <Sider
          width="250px"
          data-cy="aside"
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => {
            LocalStorage.set('menu', value)
            setCollapsed(value)
          }}
        >
          <Header collapsed={collapsed} />
          <Menu
            onOpenChange={(keys) => setOpenKeys(keys)}
            openKeys={openKeys}
            selectedKeys={selectedMenuKeys}
            onClick={handlerOnClickMenu}
            theme="light"
            mode="inline"
            items={menuItems}
          />
        </Sider>
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
