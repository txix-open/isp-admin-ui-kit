import { FormInput, FormInputPassword } from 'isp-ui-kit'
import { FC, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import EntityFormModal from '@components/EntityFormModal'
import { GitConfigurationModalType } from '@components/GitConfigurationModal/git-configuration-modal.type'

import useUnsavedChanges from '@hooks/useUnsavedChanges'

import { CredentialsType } from '@type/gitConfiguration.type'

const GitConfigurationModal: FC<GitConfigurationModalType> = ({
  title,
  onClose = () => {},
  onOk,
  open,
  credentials,
  loading = false
}) => {
  const isUpdate = Boolean(credentials)
  const credentialsRef = useRef(credentials)
  credentialsRef.current = credentials

  const {
    handleSubmit,
    control,
    reset,
    formState: { isDirty, isSubmitting }
  } = useForm<CredentialsType>({
    mode: 'onChange',
    defaultValues: credentials
  })

  useEffect(() => {
    if (open)
      reset(
        credentialsRef.current ?? {
          name: '',
          dirPath: '',
          repositoryUrl: '',
          token: ''
        }
      )
  }, [open, reset])
  const busy = loading || isSubmitting
  const draftGuard = useUnsavedChanges({
    dirty: open && isDirty,
    busy: open && busy,
    label: isUpdate
      ? `Соединение GIT «${credentials?.name}»`
      : 'Новое соединение GIT'
  })

  return (
    <EntityFormModal
      onSubmit={handleSubmit((values) => {
        if (!busy && isDirty) return onOk(values, draftGuard.markSaved)
      })}
      title={title}
      open={open}
      submitText={isUpdate ? 'Сохранить изменения' : 'Создать соединение'}
      onClose={() => draftGuard.requestLeave(onClose)}
      busy={busy}
      submitDisabled={!isDirty}
    >
      {!isUpdate && (
        <FormInput
          control={control}
          disabled={busy}
          name="name"
          label="Название"
          placeholder="Название ЗО, например 'ЗО разработки'"
          rules={{ required: ValidationRules.required }}
        />
      )}
      <FormInput
        control={control}
        disabled={busy}
        name="dirPath"
        label="Путь до папки"
        placeholder="Путь до папки с файлами конфигов"
      />
      <FormInput
        control={control}
        disabled={busy}
        name="repositoryUrl"
        label="URL репозитория"
        rules={{ required: ValidationRules.required }}
      />
      <FormInputPassword
        control={control}
        disabled={busy}
        name="token"
        label="Токен"
        rules={{ required: ValidationRules.required }}
      />
    </EntityFormModal>
  )
}

export default GitConfigurationModal
