import {
  LockOutlined,
  LogoutOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SunOutlined,
  UserOutlined
} from '@ant-design/icons'
import { Avatar, Button, Input, Popconfirm, Segmented, Tag, theme } from 'antd'
import {
  CSSProperties,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'

import ChangePasswordModal from '@components/ChangePasswordModal'

import { useAppSelector } from '@hooks/redux'
import useLogout from '@hooks/useLogout'
import useRole from '@hooks/useRole'

import { Context } from '@stores/index'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './profile-page.scss'

const ProfilePage = () => {
  const { token } = theme.useToken()
  const { changeTheme, setChangeTheme } = useContext(Context)
  const profileColors = {
    '--profile-text': token.colorText,
    '--profile-text-secondary': token.colorTextSecondary,
    '--profile-bg-container': token.colorBgContainer,
    '--profile-card-border': changeTheme
      ? token.colorBorderSecondary
      : token.colorBorder,
    '--profile-card-shadow': changeTheme
      ? '0 2px 4px rgba(0, 0, 0, 0.24), 0 10px 28px -6px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      : '0 2px 4px rgba(15, 23, 42, 0.04), 0 10px 28px -6px rgba(15, 23, 42, 0.12)',
    '--profile-border-secondary': token.colorBorderSecondary,
    '--profile-primary-bg': token.colorPrimaryBg,
    '--profile-primary': token.colorPrimary,
    '--profile-fill-tertiary': token.colorFillTertiary,
    '--profile-fill-quaternary': token.colorFillQuaternary
  } as CSSProperties
  const { role, hasPermission } = useRole()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [permissionSearch, setPermissionSearch] = useState('')
  const { profile } = useAppSelector((state) => state.profileReducer)
  const { logoutUser, isLoading } = useLogout()
  const navigate = useNavigate()

  const isPageAvailable = hasPermission(PermissionKeysType.profile_view)
  const canChangePassword = hasPermission(
    PermissionKeysType.profile_change_password
  )

  const fullName = [profile.lastName, profile.firstName]
    .filter(Boolean)
    .join(' ')
  const initials = [profile.firstName, profile.lastName]
    .filter(Boolean)
    .map((name) => name.trim().charAt(0))
    .join('')
    .toUpperCase()
  const roles: string[] = Array.isArray(profile.roleNames)
    ? profile.roleNames
    : []
  const permissions: string[] = Array.isArray(profile.permissions)
    ? profile.permissions
    : []

  const permissionQuery = permissionSearch.trim().toLowerCase()
  const filteredPermissions = permissions.filter((permission) =>
    permission.toLowerCase().includes(permissionQuery)
  )

  const highlightPermission = (permission: string) => {
    if (!permissionQuery) return permission

    const parts: ReactNode[] = []
    const normalizedPermission = permission.toLowerCase()
    let start = 0
    let match = normalizedPermission.indexOf(permissionQuery)

    while (match !== -1) {
      parts.push(permission.slice(start, match))
      const end = match + permissionQuery.length
      parts.push(
        <mark key={match} className="profile-page__search-match">
          {permission.slice(match, end)}
        </mark>
      )
      start = end
      match = normalizedPermission.indexOf(permissionQuery, start)
    }

    parts.push(permission.slice(start))
    return parts
  }

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.error)
    }
  }, [isPageAvailable])

  useEffect(() => {
    localStorage.setItem('theme', JSON.stringify(changeTheme))
  }, [changeTheme])

  return (
    <section className="profile-page" style={profileColors}>
      <ChangePasswordModal
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />
      <div className="profile-page__content">
        <header className="profile-page__header">
          <h1 className="profile-page__title">Профиль</h1>
          <p className="profile-page__subtitle">
            Учётная запись, настройки интерфейса и доступы
          </p>
        </header>

        <div className="profile-page__grid">
          <section
            className="profile-page__card profile-page__identity"
            aria-labelledby="profile-user-name"
          >
            <div className="profile-page__identity-summary">
              <Avatar
                size={56}
                className="profile-page__avatar"
                icon={!initials ? <UserOutlined /> : undefined}
              >
                {initials || undefined}
              </Avatar>
              <div className="profile-page__identity-details">
                <h2 id="profile-user-name" className="profile-page__name">
                  {fullName || profile.email || 'Пользователь'}
                </h2>
                <span className="profile-page__label">Email</span>
                <p className="profile-page__email">
                  {profile.email || 'Не указан'}
                </p>
              </div>
            </div>
            <div className="profile-page__roles">
              <div className="profile-page__roles-heading">
                <h3 className="profile-page__section-label">Роли</h3>
                <span className="profile-page__count">{roles.length}</span>
              </div>
              <div className="profile-page__tags">
                {roles.length > 0 ? (
                  roles.map((role) => (
                    <Tag key={role} className="profile-page__role-tag">
                      {role}
                    </Tag>
                  ))
                ) : (
                  <p className="profile-page__muted">Нет назначенных ролей</p>
                )}
              </div>
            </div>
          </section>

          <div className="profile-page__settings">
            <section
              className="profile-page__card"
              aria-labelledby="profile-appearance-title"
            >
              <h2
                id="profile-appearance-title"
                className="profile-page__card-title"
              >
                <SunOutlined aria-hidden />
                Оформление
              </h2>
              <div className="profile-page__setting-row">
                <div>
                  <h3 className="profile-page__setting-title">
                    Тема интерфейса
                  </h3>
                  <p className="profile-page__muted">
                    Выберите комфортное оформление
                  </p>
                </div>
                <Segmented
                  aria-label="Тема интерфейса"
                  value={changeTheme ? 'dark' : 'light'}
                  onChange={(value) => setChangeTheme(value === 'dark')}
                  options={[
                    { label: 'Светлая', value: 'light', icon: <SunOutlined /> },
                    { label: 'Тёмная', value: 'dark', icon: <MoonOutlined /> }
                  ]}
                />
              </div>
            </section>

            <section
              className="profile-page__card"
              aria-labelledby="profile-security-title"
            >
              <h2
                id="profile-security-title"
                className="profile-page__card-title"
              >
                <SafetyCertificateOutlined aria-hidden />
                Безопасность
              </h2>
              {canChangePassword && (
                <div className="profile-page__setting-row">
                  <div>
                    <h3 className="profile-page__setting-title">Пароль</h3>
                    <p className="profile-page__muted">
                      После смены пароля потребуется войти снова
                    </p>
                  </div>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Сменить пароль
                  </Button>
                </div>
              )}
              <div className="profile-page__setting-row profile-page__logout-row">
                <div>
                  <h3 className="profile-page__setting-title">
                    Выход из аккаунта
                  </h3>
                  <p className="profile-page__muted">
                    Завершить текущую сессию
                  </p>
                </div>
                <Popconfirm
                  okText="Выйти"
                  cancelText="Отмена"
                  title="Вы действительно хотите выйти из профиля?"
                  onConfirm={logoutUser}
                >
                  <Button
                    danger
                    icon={<LogoutOutlined />}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Выйти
                  </Button>
                </Popconfirm>
              </div>
            </section>
          </div>

          <section
            className="profile-page__card profile-page__permissions"
            aria-labelledby="profile-permissions-title"
          >
            <div className="profile-page__permissions-heading">
              <h2
                id="profile-permissions-title"
                className="profile-page__card-title"
              >
                Права доступа
              </h2>
              <span
                className="profile-page__count"
                role="status"
                aria-live="polite"
              >
                {permissionQuery
                  ? `${filteredPermissions.length} из ${permissions.length}`
                  : permissions.length}
              </span>
            </div>
            <p className="profile-page__muted">
              Разрешения, назначенные вашей учётной записи
            </p>
            {permissions.length > 0 && (
              <Input
                className="profile-page__permission-search"
                aria-label="Поиск по разрешениям"
                placeholder="Поиск по разрешениям"
                prefix={<SearchOutlined aria-hidden />}
                allowClear
                value={permissionSearch}
                onChange={(event) => setPermissionSearch(event.target.value)}
              />
            )}
            {filteredPermissions.length > 0 ? (
              <ul className="profile-page__permission-list">
                {filteredPermissions.map((permission, index) => (
                  <li key={`${permission}-${index}`}>
                    {highlightPermission(permission)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="profile-page__empty">
                {permissions.length > 0
                  ? 'Ничего не найдено. Попробуйте другой запрос.'
                  : 'Нет назначенных разрешений'}
              </p>
            )}
          </section>
        </div>
      </div>
    </section>
  )
}

export default ProfilePage
