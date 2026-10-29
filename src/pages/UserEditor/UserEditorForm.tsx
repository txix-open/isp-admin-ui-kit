import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, message } from 'antd'
import dayjs from 'dayjs'
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormInputPassword,
  LabelItem
} from 'isp-ui-kit'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import { dateFormats } from '@constants/date'
import { ValidationRules } from '@constants/form/validationRules'

import { PageHeader } from '@components/PageLayout'

import { notifyApiError } from '@utils/apiErrorNotifications'
import { hasUserChanges } from '@utils/formChanges'
import { findExclusiveRole } from '@utils/roleUtils'
import { getUserFullName } from '@utils/userUtils/getFullNameUtil'

import useRole from '@hooks/useRole'

import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType, RoleType } from '@type/roles.type'
import { UserType } from '@type/user.type'

import './user-editor.scss'

type UserEditorFormProps = {
  user?: UserType
  roles: RoleType[]
}

const UserEditorForm = ({ user, roles }: UserEditorFormProps) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const goToUsers = () => navigate({ pathname: routePaths.users, search })
  const isNew = !user
  const { hasPermission } = useRole()

  const canCreateUser = hasPermission(PermissionKeysType.user_create)
  const canUpdateUser = hasPermission(PermissionKeysType.user_update)

  const [createUser] = userServiceApi.useCreateUserMutation()
  const [updateUser] = userServiceApi.useUpdateUserMutation()

  const isSaveBtnAvailable = isNew ? canCreateUser : canUpdateUser

  const {
    control,
    formState: { defaultValues, isSubmitting: isSaving },
    handleSubmit,
    setValue,
    watch,
    setError
  } = useForm<UserType>({
    defaultValues: isNew
      ? {
          description: '',
          email: '',
          firstName: '',
          lastName: '',
          password: '',
          roles: []
        }
      : user,
    mode: 'onChange'
  })

  const values = useWatch({ control })
  const hasChanges = hasUserChanges(values, defaultValues ?? {})

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
  }, [watch, roles, setValue])

  const saveUser = (values: UserType) => {
    if (!hasChanges || !isSaveBtnAvailable || isSaving) return

    const { lastSessionCreatedAt, ...updatedUser } = values
    const saveRequest = isNew
      ? createUser({
          email: values.email,
          password: values.password,
          description: values.description,
          firstName: values.firstName,
          lastName: values.lastName,
          roles: values.roles
        }).unwrap()
      : updateUser(updatedUser).unwrap()

    return saveRequest
      .then(() => {
        message.success(
          isNew ? 'Пользователь успешно создан' : 'Пользователь успешно изменен'
        )
        goToUsers()
      })
      .catch((error) => {
        if (error?.status === 409) {
          setError(
            'email',
            { message: 'Пользователь с таким Email уже существует' },
            { shouldFocus: true }
          )
        }
        notifyApiError(
          error,
          isNew
            ? 'Произошла ошибка создания пользователя'
            : 'Произошла ошибка обновления пользователя'
        )
      })
  }
  const createSelectOptions = (role: RoleType[]) => {
    const options: LabelItem[] = role.map((r) => ({
      value: r.id,
      label: r.name
    }))
    return options
  }
  return (
    <section className="user-editor" data-mode={isNew ? 'create' : 'edit'}>
      <PageHeader
        className="user-editor__header"
        title={isNew ? 'Новый пользователь' : getUserFullName(user)}
        context={
          isNew ? 'Создание пользователя' : 'Редактирование пользователя'
        }
        focusOnMount
        back={
          <Button
            data-cy="user-editor__header__nav__backBtn"
            className="user-editor__header__nav__backBtn"
            type="text"
            aria-label="Вернуться к пользователям"
            disabled={isSaving}
            onClick={goToUsers}
            icon={<ArrowLeftOutlined />}
          >
            К пользователям
          </Button>
        }
        actions={
          <Button
            disabled={!hasChanges || !isSaveBtnAvailable || isSaving}
            loading={isSaving}
            data-cy="user-editor__header__btn"
            className="user-editor__header__btn"
            htmlType="submit"
            form="user-editor-form"
            type="primary"
            icon={<SaveOutlined />}
          >
            Сохранить
          </Button>
        }
        description={
          !isNew &&
          user?.lastSessionCreatedAt && (
            <span data-cy="user-editor__status" className="user-editor__status">
              Последняя сессия &nbsp;
              {dayjs(user?.lastSessionCreatedAt).format(dateFormats.fullFormat)}
            </span>
          )
        }
      />

      <form
        id="user-editor-form"
        className="user-editor__content"
        onSubmit={handleSubmit(saveUser)}
      >
        <div className="user-editor__content__wrap">
          <div className="user-editor__content__name">
            <FormInput
              label="Имя"
              rules={{ required: ValidationRules.required }}
              control={control}
              disabled={!isSaveBtnAvailable || isSaving}
              name="firstName"
            />
          </div>
          <div className="user-editor__content__name">
            <FormInput
              label="Фамилия"
              rules={{ required: ValidationRules.required }}
              control={control}
              disabled={!isSaveBtnAvailable || isSaving}
              name="lastName"
            />
          </div>
          <div className="user-editor__content__email">
            <FormInput
              label="Email"
              rules={{ required: ValidationRules.required }}
              control={control}
              disabled={!isSaveBtnAvailable || isSaving}
              name="email"
            />
          </div>

          {isNew && (
            <div className="user-editor__content__password">
              <FormInputPassword
                label="Пароль"
                rules={{ required: ValidationRules.required }}
                control={control}
                disabled={!isSaveBtnAvailable || isSaving}
                name="password"
              />
            </div>
          )}
          <div className="user-editor__content__description">
            <FormTextArea
              autoSize={{ minRows: 2, maxRows: 6 }}
              label="Описание"
              control={control}
              disabled={!isSaveBtnAvailable || isSaving}
              name="description"
            />
          </div>
          <div className="user-editor__content__roles">
            <FormSelect
              mode="multiple"
              label="Роли"
              showSearch={{ optionFilterProp: 'label' }}
              disabled={!isSaveBtnAvailable || isSaving}
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
export default UserEditorForm
