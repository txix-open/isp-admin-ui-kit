import { FormInput } from 'isp-ui-kit'
import { FC, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ValidationRules } from '@constants/form/validationRules'

import EntityFormModal from '@components/EntityFormModal'
import {
  ConfigNameFormType,
  SetConfigNameModalProps
} from '@components/SetConfigNameModal/set-config-name-modal.type'

import { getModuleScrollState } from '@utils/moduleNavigation'

import useUnsavedChanges from '@hooks/useUnsavedChanges'

import { routePaths } from '@routes/routePaths'

const SetConfigNameModal: FC<SetConfigNameModalProps> = ({
  open,
  onClose,
  currentModule = {}
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = useForm<ConfigNameFormType>({
    mode: 'onChange',
    defaultValues: { name: '' }
  })
  useEffect(() => {
    if (open) reset({ name: '' })
  }, [open, reset])
  const navigate = useNavigate()
  const { search } = useLocation()
  const { id: moduleId } = useParams()
  const draftGuard = useUnsavedChanges({
    dirty: open && isDirty,
    label: 'Название новой конфигурации'
  })
  const onSubmit = ({ name }: ConfigNameFormType) => {
    draftGuard.markSaved()
    navigate(
      { pathname: `/${moduleId}/${routePaths.configEditor}/new`, search },
      {
        state: { currentModule, name, ...getModuleScrollState() }
      }
    )
  }

  const handleCloseModal = () => {
    onClose()
    reset()
  }

  return (
    <EntityFormModal
      title="Новая конфигурация"
      open={open}
      onClose={() => draftGuard.requestLeave(handleCloseModal)}
      onSubmit={handleSubmit(onSubmit)}
      submitText="Продолжить"
    >
      <p>
        Укажите название. На следующем шаге откроется редактор конфигурации.
      </p>
      <FormInput
        control={control}
        name="name"
        label="Название конфигурации"
        rules={{ required: ValidationRules.required }}
      />
    </EntityFormModal>
  )
}
export default SetConfigNameModal
