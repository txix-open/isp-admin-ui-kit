import { SyncOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import { FormInput, FormInputNumber, FormTextArea } from 'isp-ui-kit'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import EntityFormModal from '@components/EntityFormModal'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type'

import { notifyApiError } from '@utils/apiErrorNotifications'

import useUnsavedChanges from '@hooks/useUnsavedChanges'

import applicationsApi from '@services/applicationsService'

import { AppModalType } from './app-group-modal.type'
import './app-modal.scss'

const AppModal = ({
  title,
  open,
  onClose,
  onOk,
  app,
  groupName
}: AppModalType) => {
  const [getNextId, generation] = applicationsApi.useGetNextAppIdMutation()
  const {
    control,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { isDirty, isSubmitting }
  } = useForm<ApplicationAppType>({
    defaultValues: {
      name: app?.name ?? '',
      description: app?.description ?? '',
      id: app?.id
    }
  })
  const busy = isSubmitting || generation.isLoading
  const draftGuard = useUnsavedChanges({
    dirty: open && isDirty,
    busy: open && busy,
    overlay: true,
    overlayParam: 'dialog',
    label: app ? `Приложение «${app.name}»` : 'Новое приложение'
  })
  const close = () => {
    if (!busy) draftGuard.requestLeave(onClose)
  }
  const generateId = () => {
    if (busy) return
    return getNextId()
      .unwrap()
      .then((value) => {
        const id = Number(value)
        if (!Number.isSafeInteger(id) || id < 0)
          throw new Error('Invalid application ID')
        setValue('id', id, { shouldDirty: true, shouldValidate: true })
        clearErrors('id')
      })
      .catch((error) =>
        notifyApiError(error, 'Не удалось получить идентификатор приложения')
      )
  }
  const submit = handleSubmit((values) => {
    if (!isDirty || busy) return
    return onOk(values, setError, draftGuard.markSaved)
  })

  return (
    <EntityFormModal
      title={title}
      open={open}
      onClose={close}
      onSubmit={submit}
      busy={busy}
      submitDisabled={!isDirty}
      submitText={app ? 'Сохранить изменения' : 'Создать приложение'}
    >
      <p>
        Группа: <strong>{groupName}</strong>.{' '}
        {app
          ? 'Изменения применятся после сохранения.'
          : 'Приложение появится в группе после нажатия «Создать приложение».'}
      </p>
      <div className="application-form-id">
        <FormInputNumber
          control={control}
          name="id"
          label="Идентификатор"
          min={0}
          precision={0}
          rules={{ required: ValidationRules.required }}
          disabled={busy}
        />
        {!app && (
          <Button
            icon={<SyncOutlined />}
            onClick={generateId}
            loading={generation.isLoading}
            disabled={isSubmitting}
          >
            Получить ID
          </Button>
        )}
      </div>
      <FormInput
        control={control}
        name="name"
        label="Название приложения"
        rules={{ required: ValidationRules.required }}
        disabled={busy}
      />
      <FormTextArea
        control={control}
        name="description"
        label="Описание"
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={busy}
      />
    </EntityFormModal>
  )
}

export default AppModal
