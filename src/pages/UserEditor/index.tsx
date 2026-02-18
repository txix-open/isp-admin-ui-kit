import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import dayjs from 'dayjs'
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormInputPassword,
  LabelItem
} from 'isp-ui-kit'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date'
import { ValidationRules } from '@constants/form/validationRules'

import { findExclusiveRole } from '@utils/roleUtils'

import useRole from '@hooks/useRole'

import roleApi from '@services/roleService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType, RoleType } from '@type/roles.type'
import { UserType } from '@type/user.type'

import './user-editor.scss'

const UserEditor = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state as UserType
  const isNew = location.pathname.includes('new')
  const fromApp = location.state?.fromApp || false
  const { hasPermission } = useRole()

  const canCreateUser = hasPermission(PermissionKeysType.user_create)
  const canUpdateUser = hasPermission(PermissionKeysType.user_update)

  const [createUser] = userServiceApi.useCreateUserMutation()
  const { data: roles = [], isLoading } = roleApi.useGetAllRolesQuery()

  const [updateUser] = userServiceApi.useUpdateUserMutation()

  const isSaveBtnAvailable = isNew ? canCreateUser : canUpdateUser

  const {
    control,
    formState: { isDirty },
    getValues,
    setValue,
    watch,
    setError
  } = useForm<UserType>({
    defaultValues: isNew
      ? {
          description: '',
          email: '',
          firstName: '',
          password: '',
          roles: []
        }
      : state,
    mode: 'onChange'
  })

  useEffect(() => {
    if (isNew && !fromApp) {
      navigate(routePaths.users)
    }
  }, [fromApp])

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === 'roles' && type === 'change') {
        const exclusiveRole = findExclusiveRole(roles, value.roles as number[])
        if (exclusiveRole) {
          if (value.roles && value.roles.length > 1) {
            message.error(
              <>
                Роль: <strong>{exclusiveRole.name}</strong> несовместима с
                другими ролями
              </>
            )
          }
          setValue('roles', [exclusiveRole.id])
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [watch])

  const sendForm = () => {
    if (isNew) {
      const newUser = {
        email: getValues().email,
        password: getValues().password,
        description: getValues().description,
        firstName: getValues().firstName,
        lastName: getValues().lastName,
        roles: getValues().roles
      }
      createUser(newUser)
        .unwrap()
        .then(() => {
          message.success('Пользователь успешно создан')
          navigate(routePaths.users)
        })
        .catch((error) => {
          const { status } = error
          if (status === 409) {
            setError('email', {
              message: 'Пользователь с таким Email уже существует'
            })
          }
          message.error('Произошла ошибка создания пользователя')
        })
    } else {
      const formData = getValues()
      delete formData.lastSessionCreatedAt
      updateUser(formData)
        .unwrap()
        .then(() => {
          message.success('Пользователь успешно изменен')
          navigate(routePaths.users)
        })
        .catch((error) => {
          const { status } = error
          if (status === 409) {
            setError('email', {
              message: 'Пользователь с таким Email уже существует'
            })
          }
          message.error('Произошла ошибка обновления пользователя')
        })
    }
  }
  const createSelectOptions = (role: RoleType[]) => {
    const options: LabelItem[] = role.map((r) => ({
      value: r.id,
      label: r.name
    }))
    return options
  }
  if (isLoading) {
    return <Spin />
  }
  return (
    <section className="user-editor">
      <header className="user-editor__header">
        <div className="user-editor__header__nav">
          <Button
            data-cy="user-editor__header__nav__backBtn"
            className="user-editor__header__nav__backBtn"
            type="text"
            onClick={() => navigate(routePaths.users)}
            icon={<ArrowLeftOutlined />}
          />

          <h2 className="user-editor__header__name">
            {isNew ? 'Новый пользователь' : `${state.firstName}`}
          </h2>
          <Button
            disabled={!isDirty || !isSaveBtnAvailable}
            data-cy="user-editor__header__btn"
            className="user-editor__header__btn"
            onClick={() => sendForm()}
            type="primary"
            icon={<SaveOutlined />}
          >
            Сохранить
          </Button>
        </div>

        {isNew ? (
          ''
        ) : (
          <span data-cy="user-editor__status" className="user-editor__status">
            {state.lastSessionCreatedAt && (
              <>
                Последняя сессия &nbsp;
                {dayjs(state.lastSessionCreatedAt).format(
                  dateFormats.fullFormat
                )}
              </>
            )}
          </span>
        )}
      </header>

      <form className="user-editor__content">
        <div className="user-editor__content__wrap">
          <div className="user-editor__content__name">
            <FormInput
              label="Имя"
              rules={{ required: ValidationRules.required }}
              control={control}
              name="firstName"
            />
          </div>
          <div className="user-editor__content__name">
            <FormInput
              label="Фамилия"
              rules={{ required: ValidationRules.required }}
              control={control}
              name="lastName"
            />
          </div>
          <div className="user-editor__content__email">
            <FormInput
              label="Email"
              rules={{ required: ValidationRules.required }}
              control={control}
              name="email"
            />
          </div>

          {isNew && (
            <div className="user-editor__content__password">
              <FormInputPassword
                label="Пароль"
                rules={{ required: ValidationRules.required }}
                control={control}
                name="password"
              />
            </div>
          )}
          <div className="user-editor__content__description">
            <FormTextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              label="Описание"
              control={control}
              name="description"
            />
          </div>
          <div className="user-editor__content__roles">
            <FormSelect
              mode="multiple"
              label="Роли"
              optionFilterProp="label"
              disabled={!hasPermission(PermissionKeysType.user_update)}
              control={control}
              name="roles"
              options={createSelectOptions(roles)}
            />
          </div>
        </div>
      </form>
    </section>
  )
}
export default UserEditor
