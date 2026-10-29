import {
  ApartmentOutlined,
  AppstoreOutlined,
  AuditOutlined,
  ClockCircleOutlined,
  DeploymentUnitOutlined,
  FileProtectOutlined,
  FunctionOutlined,
  HistoryOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import type { CustomMenuItemType } from './layout.type'

export const menuConfig = (name: string): CustomMenuItemType[] => [
  {
    label: name || '',
    key: 'profile',
    icon: <UserOutlined />,
    className: 'user-item',
    route: routePaths.profile,
    permissions: [PermissionKeysType.profile_view]
  },
  {
    key: 'application_groups',
    label: 'Приложения',
    icon: <AppstoreOutlined />,
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
    icon: <DeploymentUnitOutlined />,
    route: routePaths.modules,
    permissions: [PermissionKeysType.module_view]
  },
  {
    key: 'sessionManagement',
    label: 'Пользователи и роли',
    visibilityMode: 'children',
    icon: <TeamOutlined />,
    children: [
      {
        key: 'users',
        label: 'Пользователи',
        icon: <UserOutlined />,
        route: routePaths.users,
        permissions: [PermissionKeysType.user_view]
      },
      {
        key: 'sessions',
        label: 'Пользовательские сессии',
        icon: <ClockCircleOutlined />,
        route: routePaths.sessions,
        permissions: [PermissionKeysType.session_view]
      },
      {
        key: 'security_logs',
        label: 'Журнал событий',
        icon: <HistoryOutlined />,
        route: routePaths.securityLog,
        permissions: [PermissionKeysType.security_log_view]
      },
      {
        key: 'roles',
        label: 'Роли',
        icon: <AuditOutlined />,
        route: routePaths.roles,
        permissions: [PermissionKeysType.role_view]
      }
    ],
    permissions: []
  },
  {
    key: 'git_configuration',
    permissionMode: 'all',
    label: 'Git конфигурация',
    icon: <ApartmentOutlined />,
    route: routePaths.gitConfiguration,
    permissions: [
      PermissionKeysType.git_configuration_view,
      PermissionKeysType.module_view
    ]
  }
]
