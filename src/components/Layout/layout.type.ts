import { MenuProps } from 'antd'

export enum MenuItemKeysType {
  users = 'users',
  sessions = 'sessions',
  securityLog = 'securityLog',
  appAccess = 'appAccess',
  roles = 'roles',
  logout = 'logout',
  profile = 'profile',
  modules = 'modules',
  applicationsGroup = 'applications_group'
}
export enum MenuItemLabelsType {
  users = 'Пользователи',
  sessions = 'Пользовательские сессии',
  securityLog = 'Просмотр журналов ИБ',
  appAccess = 'Доступы приложений',
  roles = 'Роли',
  profile = 'Профиль',
  modules = 'Модули',
  logout = 'Выход',
  applications_group = 'Группы приложений'
}

interface MenuItem {
  key: MenuItemKeysType
  parent: string[]
}

export const menuKeys: Record<MenuItemKeysType, MenuItem> = {
  [MenuItemKeysType.users]: {
    key: MenuItemKeysType.users,
    parent: ['users']
  },
  [MenuItemKeysType.sessions]: {
    key: MenuItemKeysType.sessions,
    parent: ['users']
  },
  [MenuItemKeysType.securityLog]: {
    key: MenuItemKeysType.securityLog,
    parent: ['users']
  },
  [MenuItemKeysType.appAccess]: {
    key: MenuItemKeysType.appAccess,
    parent: ['appAccess']
  },
  [MenuItemKeysType.roles]: {
    key: MenuItemKeysType.roles,
    parent: ['users']
  },
  [MenuItemKeysType.logout]: {
    key: MenuItemKeysType.logout,
    parent: ['']
  },
  [MenuItemKeysType.profile]: {
    key: MenuItemKeysType.profile,
    parent: ['']
  },
  [MenuItemKeysType.modules]: {
    key: MenuItemKeysType.modules,
    parent: ['modules']
  },
  [MenuItemKeysType.applicationsGroup]: {
    key: MenuItemKeysType.applicationsGroup,
    parent: ['applicationsGroup']
  }
}

export type MenuItemType = Required<MenuProps>['items'][number]
