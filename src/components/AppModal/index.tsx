import { SyncOutlined } from '@ant-design/icons'
import { Button, Modal } from 'antd'
import { FormInput, FormInputNumber, FormTextArea } from 'isp-ui-kit'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type'

import { notifyApiError } from '@utils/apiErrorNotifications'

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
  const close = () => {
    if (!busy) onClose()
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
    return onOk(values, setError)
  })

  return (
    <Modal
      title={title}
      open={open}
      onCancel={close}
      destroyOnHidden
      width={640}
      mask={{ closable: false }}
      keyboard={!busy}
      closable={!busy}
      footer={null}
    >
      <form onSubmit={submit}>
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
        <div className="application-form-actions">
          <Button onClick={close} disabled={busy}>
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={isSubmitting}
            disabled={!isDirty || busy}
          >
            {app ? 'Сохранить изменения' : 'Создать приложение'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AppModal
