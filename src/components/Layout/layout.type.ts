import { MenuProps } from 'antd'

import { RoutersPropsType } from '@type/app.type.ts'

export enum MenuItemKeysType {
  users = 'users',
  sessions = 'sessions',
  securityLog = 'securityLog',
  appAccess = 'appAccess',
  roles = 'roles',
  profile = 'profile',
  modules = 'modules',
  applicationsGroup = 'applications_group'
}

export enum MenuParentItemKeysType {
  sessionManagement = 'session_management'
}

export const MenuItemLabelsType: Record<
  MenuItemKeysType | MenuParentItemKeysType,
  string
> = {
  [MenuItemKeysType.users]: 'Пользователи',
  [MenuItemKeysType.sessions]: 'Пользовательские сессии',
  [MenuItemKeysType.securityLog]: 'Просмотр журналов ИБ',
  [MenuItemKeysType.appAccess]: 'Доступы приложений',
  [MenuItemKeysType.roles]: 'Роли',
  [MenuItemKeysType.profile]: 'Профиль',
  [MenuItemKeysType.modules]: 'Модули',
  [MenuItemKeysType.applicationsGroup]: 'Приложения',
  [MenuParentItemKeysType.sessionManagement]: 'Пользователи и роли'
}

interface MenuItem {
  key: MenuItemKeysType
  parent: string[]
}

export const menuKeys: Record<MenuItemKeysType, MenuItem> = {
  [MenuItemKeysType.profile]: { key: MenuItemKeysType.profile, parent: [] },
  [MenuItemKeysType.applicationsGroup]: {
    key: MenuItemKeysType.applicationsGroup,
    parent: []
  },
  [MenuItemKeysType.appAccess]: { key: MenuItemKeysType.appAccess, parent: [] },
  [MenuItemKeysType.modules]: { key: MenuItemKeysType.modules, parent: [] },
  [MenuItemKeysType.users]: {
    key: MenuItemKeysType.users,
    parent: [MenuParentItemKeysType.sessionManagement]
  },
  [MenuItemKeysType.sessions]: {
    key: MenuItemKeysType.sessions,
    parent: [MenuParentItemKeysType.sessionManagement]
  },
  [MenuItemKeysType.securityLog]: {
    key: MenuItemKeysType.securityLog,
    parent: [MenuParentItemKeysType.sessionManagement]
  },
  [MenuItemKeysType.roles]: {
    key: MenuItemKeysType.roles,
    parent: [MenuParentItemKeysType.sessionManagement]
  }
}

export type MenuItemType = Required<MenuProps>['items'][number] & {
  children?: MenuItemType[]
}

export interface LayoutComponentPropsType extends RoutersPropsType {}
