export enum PermissionKeysType {
  profile_view = 'profile_view', // Просмотр экрана "Профиль"
  profile_change_password = 'profile_change_password', // Возможность смены пароля

  application_group_view = 'application_group_view', // Просмотр экрана "Группы приложений"
  application_group_add = 'application_group_add', // Добавление новой группы
  application_group_edit = 'application_group_edit', // Редактирование существующей группы
  application_group_delete = 'application_group_delete', // Удаление группы
  application_group_app_add = 'application_group_app_add', // Добавление нового приложения
  application_group_app_edit = 'application_group_app_edit', // Редактирование существующего приложения
  application_group_app_delete = 'application_group_app_delete', // Удаление приложения
  application_group_token_view = 'application_group_token_view', // Просмотр раздела "Токены"
  application_group_token_add = 'application_group_token_add', // Добавление нового токена
  application_group_token_delete = 'application_group_token_delete', // Удаление нового токена

  app_access_view = 'app_access_view', // Просмотра экрана "Доступы приложений"
  app_access_edit = 'app_access_edit', // Редактирование элементов "Доступы приложений"

  variable_view = 'variable_view', // Просмотр экрана "Переменные"
  variable_add = 'variable_add', // Добавление новой переменной
  variable_edit = 'variable_edit', // Редактирование переменной
  variable_delete = 'variable_delete', // Удаление переменной

  module_view = 'module_view', // Просмотр экрана "Модули"
  module_delete = 'module_delete', // Удаление модуля
  module_configuration_save_unsafe = 'module_configuration_save_unsafe', // Небезопасное сохранение конфигурации модуля
  module_history_set = 'module_history_set', // Установить выбранную версию модуля
  module_history_delete_version = 'module_history_delete_version', // Удалить выбранную версию модуля
  module_configuration_edit = 'module_configuration_edit', // Редактирование конфигурации модуля
  module_configuration_add = 'module_configuration_add', // Создание новой конфигурации
  module_configuration_set_active = 'module_configuration_set_active', // Сделать конфигурацию активной

  user_view = 'user_view', // Просмотр экрана "Пользователи"
  user_block = 'user_block', // Блокировка пользователя
  user_create = 'user_create', // Создать пользователя
  user_update = 'user_update', // Обновить пользователя
  user_delete = 'user_delete', // Удаление пользователя

  session_view = 'session_view', // Просмотр экрана "Пользовательские сессии"
  session_revoke = 'session_revoke', // Отзыв сессии

  role_view = 'role_view', // Просмотр экрана ролей
  role_add = 'role_add', // Создание роли
  role_update = 'role_update', // Обновление роли
  role_delete = 'role_delete', // Удаление роли

  security_log_view = 'security_log_view',
  ALWAYS_VIEW = 'ALWAYS_VIEW' // Просмотр экрана "Просмотр журналов ИБ"
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
