import { message } from 'antd'
import { FormInputPassword } from 'isp-ui-kit'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { apiPaths } from '@constants/api/apiPaths'

import {
  ChangePasswordModalProps,
  ChangePasswordModalType
} from '@components/ChangePasswordModal/change-password-modal.type'
import EntityFormModal from '@components/EntityFormModal'

import { ChangeProfilePassword } from '@pages/ProfilePage/profile-page.type'

import { ignoreApiError, notifyApiError } from '@utils/apiErrorNotifications'

import useLogout from '@hooks/useLogout'

import { apiService } from '@services/apiService'

const ChangePasswordModal: FC<ChangePasswordModalProps> = ({
  open,
  onClose
}) => {
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    watch,
    reset,
    trigger,
    formState: { isSubmitting }
  } = useForm<ChangePasswordModalType>({
    mode: 'onChange'
  })
  const [loading, setLoading] = useState(false)
  const { logoutUser } = useLogout()

  const onSubmit = (formValue: ChangePasswordModalType) => {
    if (loading || isSubmitting) return
    setLoading(true)
    return apiService
      .post<ChangeProfilePassword>(apiPaths.changePassword, {
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword
      })
      .then(() => logoutUser())
      .then(() => {
        message.success('Пароль успешно изменен')
        clearErrors('oldPassword')
        onClose()
      })
      .catch((error) => {
        if (Number(error.response?.data?.errorCode) === 1001) {
          ignoreApiError(error)
          setError('oldPassword', {
            message: 'Неверный текущий пароль'
          })
        } else {
          notifyApiError(error, 'Не удалось изменить пароль')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCloseModal = () => {
    if (loading || isSubmitting) return
    onClose()
    reset()
  }

  const confirmPassword = watch('confirmPassword')
  const newPassword = watch('newPassword')

  useEffect(() => {
    if (open && (newPassword || confirmPassword)) {
      void trigger(['newPassword', 'confirmPassword'])
    }
  }, [open, newPassword, confirmPassword, trigger])

  useEffect(() => {
    if (open) reset({ oldPassword: '', newPassword: '', confirmPassword: '' })
  }, [open, reset])

  return (
    <EntityFormModal
      title="Сменить пароль"
      open={open}
      onClose={handleCloseModal}
      onSubmit={handleSubmit(onSubmit)}
      submitText="Изменить пароль"
      busy={loading || isSubmitting}
    >
      <FormInputPassword
        rules={{
          required: { value: true, message: 'Поле не может быть пустым' }
        }}
        label="Текущий пароль"
        control={control}
        name="oldPassword"
        disabled={loading || isSubmitting}
      />
      <FormInputPassword
        rules={{
          required: { value: true, message: 'Поле не может быть пустым' },
          validate: (value) => {
            return value === confirmPassword || 'Пароли не совпадают'
          }
        }}
        label="Новый пароль"
        control={control}
        name="newPassword"
        disabled={loading || isSubmitting}
      />

      <FormInputPassword
        rules={{
          required: { value: true, message: 'Поле не может быть пустым' },
          validate: (value) => {
            if (value !== newPassword) return 'Пароли не совпадают'
            if (!value) return 'Поле не может быть пустым'
            return true
          }
        }}
        label="Подтвердите пароль"
        control={control}
        name="confirmPassword"
        disabled={loading || isSubmitting}
      />
    </EntityFormModal>
  )
}
export default ChangePasswordModal
