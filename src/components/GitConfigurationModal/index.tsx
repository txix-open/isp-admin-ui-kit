import { FormInput, FormInputPassword } from 'isp-ui-kit'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import Modal from '@widgets/Modal'

import { GitConfigurationModalType } from '@components/GitConfigurationModal/git-configuration-modal.type'

import { CredentialsType } from '@type/gitConfiguration.type'

const GitConfigurationModal: FC<GitConfigurationModalType> = ({
  title,
  onClose,
  onOk,
  open,
  credentials,
  loading = false
}) => {
  const isUpdate = Boolean(credentials)

  const { handleSubmit, control, reset } = useForm<CredentialsType>({
    mode: 'onChange',
    defaultValues: credentials
  })

  useEffect(() => {
    reset(credentials)
  }, [open])

  return (
    <Modal
      onOk={handleSubmit(onOk)}
      title={title}
      open={open}
      footer={{ onCanselText: 'Отмена', onOkText: 'Сохранить' }}
      onClose={onClose}
      loading={loading}
    >
      <form>
        <FormInput
          control={control}
          name="name"
          label="Название"
          placeholder="Название ЗО, например 'ЗО разработки'"
          rules={{ required: ValidationRules.required }}
        />
        <FormInput
          control={control}
          name="dirPath"
          label="Путь до папки"
          placeholder="Путь до папки с файлами конфигов"
        />
        <FormInput
          control={control}
          name="repositoryUrl"
          label="URL репозитория"
          rules={{ required: ValidationRules.required }}
        />
        <FormInputPassword
          control={control}
          name="token"
          label="Токен"
          rules={isUpdate ? undefined : { required: ValidationRules.required }}
        />
      </form>
    </Modal>
  )
}

export default GitConfigurationModal
