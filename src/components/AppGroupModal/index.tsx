import { FormComponents } from 'isp-ui-kit'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules.ts'

import Modal from '@widgets/Modal'

import { AppGroupModalType } from '@components/AppGroupModal/app-group-modal.type.ts'

import { ApplicationsGroupType } from '@pages/ApplicationsPage/applications.type.ts'

const { FormInput, FormTextArea } = FormComponents

const AppGroupModal: FC<AppGroupModalType> = ({
  title,
  onClose,
  onOk,
  open,
  appGroup
}) => {
  const { handleSubmit, control, reset } = useForm<ApplicationsGroupType>({
    mode: 'onChange',
    defaultValues: appGroup
  })

  useEffect(() => {
    reset(appGroup)
  }, [open])

  return (
    <Modal
      onOk={handleSubmit(onOk)}
      title={title}
      open={open}
      footer={{ onCanselText: 'Отмена', onOkText: 'Сохранить' }}
      onClose={onClose}
    >
      <form>
        <FormInput
          control={control}
          name="name"
          label="Наименование"
          rules={{ required: ValidationRules.required }}
        />
        <FormTextArea
          autoSize={{ minRows: 2, maxRows: 6 }}
          control={control}
          label="Описание"
          name="description"
        />
      </form>
    </Modal>
  )
}

export default AppGroupModal
