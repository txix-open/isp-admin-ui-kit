import { FormInput, FormTextArea } from 'isp-ui-kit'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import EntityFormModal from '@components/EntityFormModal'

import { NewApplicationsGroupType } from '@pages/ApplicationsPage/applications.type'

import useUnsavedChanges from '@hooks/useUnsavedChanges'

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
  const draftGuard = useUnsavedChanges({
    dirty: open && isDirty,
    busy: open && isSubmitting,
    overlay: true,
    overlayParam: 'dialog',
    label: appGroup ? `Группа «${appGroup.name}»` : 'Новая группа приложений'
  })
  const close = () => {
    if (!isSubmitting) draftGuard.requestLeave(onClose)
  }
  const submit = handleSubmit((values) => {
    if (!isDirty || isSubmitting) return
    return onOk(values, draftGuard.markSaved)
  })

  return (
    <EntityFormModal
      title={title}
      open={open}
      onClose={close}
      onSubmit={submit}
      busy={isSubmitting}
      submitDisabled={!isDirty}
      submitText={appGroup ? 'Сохранить изменения' : 'Создать группу'}
    >
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
    </EntityFormModal>
  )
}

export default AppGroupModal
