export enum PermissionKeysType {
  read = 'read', // Просмотр страниц
  write = 'write', // Редактирование страниц
  user_view = 'user_view', // Просмотр списка пользователей
  user_block = 'user_block', // Блокировка пользователя
  user_create = 'user_create', // Создать пользователя
  user_update = 'user_update', // Обновить пользователя
  user_delete = 'user_delete', // Удаление пользователя
  session_view = 'session_view', // Просмотр списка пользовательских сессий
  session_revoke = 'session_revoke', // Отзыв сессии
  role_view = 'role_view', // Просмотр экрана ролей
  role_add = 'role_add', // Создание роли
  role_update = 'role_update', // Обновление роли
  role_delete = 'role_delete', // Удаление роли
  security_log_view = 'security_log_view' // Просмотр журналов ИБ
}

export interface RoleType {
  changeMessage?: string
  createdAt: string
  description: string
  externalGroup: string
  id: number
  name: string
  permissions: PermissionKeysType[]
  updatedAt: string
  immutable: boolean
  exclusive: boolean
}

export type NewRoleType = Omit<RoleType, 'id' | 'createdAt' | 'updatedAt'>

export interface PermissionType {
  key: PermissionKeysType
  name: string
}
