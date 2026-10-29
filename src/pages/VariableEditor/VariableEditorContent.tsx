import { message } from 'antd'
import { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import { useLocation, useNavigate } from 'react-router-dom'

import EntityFormModal from '@components/EntityFormModal'
import VariableEditorForm from '@components/VariablesComponents/VariableEditorForm'
import VariableEditorHeader from '@components/VariablesComponents/VariableEditorHeader'

import { handleVariableApiError } from '@utils/variableUtils'

import useRole from '@hooks/useRole'
import useUnsavedChanges from '@hooks/useUnsavedChanges'

import variablesApi from '@services/variablesService'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'
import { PermissionKeysType } from '@type/roles.type'

import './variable-editor.scss'

const VariableEditorContent = ({
  variable,
  onClose
}: {
  variable?: VariableType
  onClose?: () => void
}) => {
  const isNew = !variable
  const navigate = useNavigate()
  const { search } = useLocation()
  const { hasPermission } = useRole()
  const canSave = hasPermission(
    isNew ? PermissionKeysType.variable_add : PermissionKeysType.variable_edit
  )
  const {
    control,
    watch,
    handleSubmit,
    reset,
    setError,
    formState: { isDirty, isSubmitting }
  } = useForm<VariableType>({
    defaultValues: variable
      ? {
          ...variable,
          description: variable.description ?? '',
          value: variable.value ?? ''
        }
      : { name: '', description: '', type: 'TEXT', value: '' }
  })
  const draftGuard = useUnsavedChanges({
    dirty: isDirty && canSave,
    busy: isSubmitting,
    overlay: Boolean(onClose),
    label: isNew ? 'Новая переменная' : `Переменная «${variable.name}»`
  })
  const [createVariable] = variablesApi.useCreateVariableMutation()
  const [updateVariable] = variablesApi.useUpdateVariableMutation()

  const saveVariable = (values: VariableType) => {
    if (!canSave || !isDirty || isSubmitting) return
    const data = {
      name: values.name,
      description: values.description,
      value: values.value
    }
    const request = isNew
      ? createVariable({ ...data, type: values.type }).unwrap()
      : updateVariable(data).unwrap()

    return request
      .then(() => {
        draftGuard.markSaved()
        reset(values)
        message.success(
          isNew ? 'Переменная успешно создана' : 'Переменная успешно обновлена'
        )
        if (onClose) onClose()
        else navigate({ pathname: routePaths.variables, search })
      })
      .catch((error: AxiosError<MSPError>) => {
        handleVariableApiError(error, 'Не удалось сохранить переменную', {
          setError
        })
      })
  }

  if (onClose)
    return (
      <EntityFormModal
        title="Новая переменная"
        open
        onClose={() => draftGuard.requestLeave(onClose)}
        onSubmit={handleSubmit(saveVariable)}
        busy={isSubmitting}
        submitDisabled={!isDirty || !canSave}
        submitText="Создать переменную"
      >
        <VariableEditorForm
          compact
          control={control}
          isNewVariable={isNew}
          isEditPermission={canSave}
          isSaving={isSubmitting}
          typeWatch={watch('type')}
        />
      </EntityFormModal>
    )

  return (
    <form className="variable-editor" onSubmit={handleSubmit(saveVariable)}>
      <VariableEditorHeader
        isNewVariable={isNew}
        isEditPermission={canSave}
        isDirty={isDirty}
        isLoading={isSubmitting}
        title={isNew ? 'Новая переменная' : variable.name}
      />
      <VariableEditorForm
        control={control}
        isNewVariable={isNew}
        isEditPermission={canSave}
        isSaving={isSubmitting}
        typeWatch={watch('type')}
      />
    </form>
  )
}

export default VariableEditorContent
