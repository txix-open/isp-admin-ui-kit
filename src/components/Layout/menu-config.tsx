import {
  AppstoreAddOutlined,
  FileProtectOutlined,
  ProductOutlined,
  ProfileOutlined
} from '@ant-design/icons'

import DefaultUser from '@components/Icons/DefaultUser.tsx'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

export const menuConfig = (name: string) => [
  {
    label: name || '',
    key: 'profile',
    icon: <DefaultUser />,
    route: routePaths.profile,
    permissions: [PermissionKeysType.read]
  },
  {
    key: 'applications_group',
    label: 'Приложения',
    icon: <AppstoreAddOutlined />,
    route: routePaths.applicationsGroup,
    permissions: [PermissionKeysType.read]
  },
  {
    key: 'appAccess',
    label: 'Доступы приложений',
    icon: <FileProtectOutlined />,
    route: routePaths.appAccess,
    permissions: [PermissionKeysType.read]
  },
  {
    key: 'modules',
    label: 'Модули',
    icon: <ProductOutlined />,
    route: routePaths.modules,
    permissions: [PermissionKeysType.read]
  },
  {
    key: 'sessionManagement',
    label: 'Пользователи и роли',
    icon: <ProfileOutlined />,
    children: [
      {
        key: 'users',
        label: 'Пользователи',
        route: routePaths.users,
        permissions: [PermissionKeysType.user_view]
      },
      {
        key: 'sessions',
        label: 'Пользовательские сессии',
        route: routePaths.sessions,
        permissions: [PermissionKeysType.session_view]
      },
      {
        key: 'securityLog',
        label: 'Просмотр журналов ИБ',
        route: routePaths.securityLog,
        permissions: [PermissionKeysType.security_log_view]
      },
      {
        key: 'roles',
        label: 'Роли',
        route: routePaths.roles,
        permissions: [PermissionKeysType.role_view]
      }
    ],
    permissions: [
      PermissionKeysType.user_view,
      PermissionKeysType.session_view,
      PermissionKeysType.security_log_view,
      PermissionKeysType.role_view
    ]
  }
]
