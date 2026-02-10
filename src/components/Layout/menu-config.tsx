import {
  AppstoreAddOutlined,
  FileProtectOutlined,
  FunctionOutlined,
  ProductOutlined,
  ProfileOutlined
} from '@ant-design/icons'

import DefaultUser from '@components/Icons/DefaultUser'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

export const menuConfig = (name: string) => [
  {
    label: name || '',
    key: 'profile',
    icon: <DefaultUser />,
    className: 'user-item',
    route: routePaths.profile,
    permissions: [PermissionKeysType.profile_view]
  },
  {
    key: 'application_groups',
    label: 'Приложения',
    icon: <AppstoreAddOutlined />,
    route: routePaths.applicationsGroup,
    permissions: [PermissionKeysType.application_group_view]
  },
  {
    key: 'app_access',
    label: 'Доступы приложений',
    icon: <FileProtectOutlined />,
    route: routePaths.appAccess,
    permissions: [PermissionKeysType.app_access_view]
  },
  {
    key: 'variables',
    label: 'Переменные',
    icon: <FunctionOutlined />,
    route: routePaths.variables,
    permissions: [PermissionKeysType.variable_view]
  },
  {
    key: 'modules',
    label: 'Модули',
    icon: <ProductOutlined />,
    route: routePaths.modules,
    permissions: [PermissionKeysType.module_view]
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
        key: 'security_logs',
        label: 'Журнал событий',
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
