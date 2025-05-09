import { Button, Descriptions, Popconfirm } from 'antd'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import PermissionList from '@widgets/PermissionList'

import ChangePasswordModal from '@components/ChangePasswordModal'
import RoleList from '@components/RoleList'

import { useAppSelector } from '@hooks/redux.ts'
import useLogout from '@hooks/useLogout.tsx'
import useRole from '@hooks/useRole.tsx'

import { Context } from '@stores/index.tsx'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

import './profile-page.scss'

const ProfilePage = () => {
  const { role, hasPermission } = useRole()
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { profile } = useAppSelector((state) => state.profileReducer)
  const { logoutUser, isLoading } = useLogout()
  const { changeTheme, setChangeTheme } = useContext(Context)
  const navigate = useNavigate()

  const isPageAvailable = hasPermission(PermissionKeysType.profile_view)
  const canChangePassword = hasPermission(
    PermissionKeysType.profile_change_password
  )

  const onChangeTheme = () => {
    setChangeTheme((prev: any) => !prev)
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
    <section className="profile-page">
      <ChangePasswordModal
        onClose={() => setIsModalOpen(false)}
        open={isModalOpen}
      />
      <header className="profile-page__header">
        <h1 className="profile-page__title">{`${profile.lastName} ${profile.firstName}`}</h1>
        <Button onClick={onChangeTheme}>Сменить тему</Button>
      </header>
      <div className="profile-page__user-info">
        <div className="profile-page__user-info__email-wrapper">
          <Descriptions>
            <Descriptions.Item label="Email">{profile.email}</Descriptions.Item>
          </Descriptions>
        </div>
      </div>
      <RoleList userRoles={profile.roles} />
      <PermissionList permissions={profile.permissions} />
      <div className="profile-page__actions">
        <Popconfirm
          okText="Выйти"
          cancelText="Отмена"
          title="Вы действительно хотите выйти из профиля?"
          onConfirm={logoutUser}
        >
          <Button
            loading={isLoading}
            disabled={isLoading}
            className="profile-page__actions__exit-btn"
          >
            Выход
          </Button>
        </Popconfirm>
        {canChangePassword && (
          <Button
            className="profile-page__actions__change-pass-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Сменить пароль
          </Button>
        )}
      </div>
    </section>
  )
}

export default ProfilePage
