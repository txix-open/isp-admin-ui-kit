import { Button, Modal } from 'antd'
import { FormInput, FormTextArea } from 'isp-ui-kit'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import { NewApplicationsGroupType } from '@pages/ApplicationsPage/applications.type'

import '../AppModal/app-modal.scss'
import { AppGroupModalType } from './app-group-modal.type'

const AppGroupModal = ({
  title,
  open,
  onClose,
  onOk,
  appGroup
}: AppGroupModalType) => {
  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting }
  } = useForm<NewApplicationsGroupType>({
    defaultValues: {
      name: appGroup?.name ?? '',
      description: appGroup?.description ?? ''
    }
  })
  const close = () => {
    if (!isSubmitting) onClose()
  }
  const submit = handleSubmit((values) => {
    if (!isDirty || isSubmitting) return
    return onOk(values)
  })

  return (
    <Modal
      title={title}
      open={open}
      onCancel={close}
      destroyOnHidden
      width={640}
      mask={{ closable: false }}
      keyboard={!isSubmitting}
      closable={!isSubmitting}
      footer={null}
    >
      <form onSubmit={submit}>
        <p>
          {appGroup
            ? 'Изменения применятся после сохранения.'
            : 'Группа ещё не создана. Она появится в списке после нажатия «Создать группу».'}
        </p>
        <FormInput
          control={control}
          name="name"
          label="Название группы"
          rules={{ required: ValidationRules.required }}
          disabled={isSubmitting}
        />
        <FormTextArea
          control={control}
          name="description"
          label="Описание"
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={isSubmitting}
        />
        <div className="application-form-actions">
          <Button onClick={close} disabled={isSubmitting}>
            Отмена
          </Button>
          <Button
            htmlType="submit"
            type="primary"
            loading={isSubmitting}
            disabled={!isDirty || isSubmitting}
          >
            {appGroup ? 'Сохранить изменения' : 'Создать группу'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default AppGroupModal
