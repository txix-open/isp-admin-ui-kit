import { message } from 'antd'
import { FormComponents } from 'isp-ui-kit'
import { FC, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { apiPaths } from '@constants/api/apiPaths.ts'

import Modal from '@widgets/Modal'

import {
  ChangePasswordModalProps,
  ChangePasswordModalType
} from '@components/ChangePasswordModal/change-password-modal.type.ts'

import { ChangeProfilePassword } from '@pages/ProfilePage/profile-page.type.ts'

import useLogout from '@hooks/useLogout.tsx'

import { apiService } from '@services/apiService.ts'

const { FormInputPassword } = FormComponents
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
    trigger
  } = useForm<ChangePasswordModalType>({
    mode: 'onChange'
  })
  const [loading, setLoading] = useState(false)
  const { logoutUser } = useLogout()

  const onSubmit = async (formValue: ChangePasswordModalType) => {
    setLoading(true)
    try {
      await apiService.post<ChangeProfilePassword>(apiPaths.changePassword, {
        oldPassword: formValue.oldPassword,
        newPassword: formValue.newPassword
      })
      await logoutUser()
      message.success('Пароль успешно изменен')
      clearErrors('oldPassword')
      onClose()
    } catch (error: any) {
      if (error.response.data.errorCode === 1001) {
        setError('oldPassword', {
          message: 'Не верный текущий пароль'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  const confirmPassword = watch('confirmPassword')
  const newPassword = watch('newPassword')

  useEffect(() => {
    trigger('newPassword')
    trigger('confirmPassword')
  }, [newPassword, confirmPassword])

  return (
    <Modal
      title="Сменить пароль"
      open={open}
      onClose={handleCloseModal}
      onOk={handleSubmit(onSubmit)}
      footer={{ onOkText: 'Изменить пароль', onCanselText: 'Отмена' }}
      loading={loading}
    >
      <form key="change-pass-modal">
        <FormInputPassword
          rules={{
            required: { value: true, message: 'Поле не может быть пустым' }
          }}
          label="Текущий пароль"
          control={control}
          name="oldPassword"
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
        />
      </form>
    </Modal>
  )
}
export default ChangePasswordModal
