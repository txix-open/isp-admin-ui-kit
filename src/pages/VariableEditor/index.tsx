import { Spin, message } from 'antd'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import VariableEditorForm from '@components/VariablesComponents/VariableEditorForm'
import VariableEditorHeader from '@components/VariablesComponents/VariableEditorHeader'

import { handleVariableApiError } from '@utils/variableUtils.ts'

import useRole from '@hooks/useRole.tsx'

import variablesApi from '@services/variablesService.ts'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './variable-editor.scss'

const VariableEditor = () => {
  const navigate = useNavigate()
  const { id = '' } = useParams()
  const isNewVariable = id === 'new'

  const {
    data: variable,
    isLoading,
    isError,
    error
  } = variablesApi.useGetVariableByNameQuery(id, { skip: isNewVariable })
  const {
    control,
    watch,
    reset,
    handleSubmit,
    setError,
    formState: { isDirty }
  } = useForm<VariableType>({
    defaultValues: { type: 'TEXT' }
  })
  const typeWatch = watch('type')

  const [createVariable, { isLoading: isCreateMethodLoading }] =
    variablesApi.useCreateVariableMutation()
  const [updateVariable, { isLoading: isUpdateMethodLoading }] =
    variablesApi.useUpdateVariableMutation()

  const isSomeMethodLoading = isUpdateMethodLoading || isCreateMethodLoading

  const { role, hasPermission } = useRole()
  const isEditPermission = hasPermission(PermissionKeysType.write)

  useEffect(() => {
    if (!isEditPermission) {
      navigate(routePaths.variables)
    }
  }, [isEditPermission])

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  useEffect(() => {
    if (variable) reset(variable)
  }, [reset, variable])

  if (isLoading) {
    return <Spin fullscreen />
  }
  if (isError) {
    handleVariableApiError(
      error as AxiosError<MSPError>,
      'Произошла ошибка получения переменной',
      { message }
    )
    return <Navigate to={routePaths.error} />
  }

  const goToVariablePage = () => navigate(routePaths.variables)

  const handleCreateVariable = async (formData: VariableType) => {
    const sendData: NewVariableType = {
      description: formData.description,
      name: formData.name,
      value: formData.value,
      type: formData.type
    }
    createVariable(sendData)
      .unwrap()
      .then(() => {
        message.success('Переменная успешно создана')
        goToVariablePage()
      })
      .catch((error: AxiosError<MSPError>) => {
        handleVariableApiError(error, 'Ошибка при создании переменной', {
          setError,
          message
        })
      })
  }

  const handleUpdateVariable = async (formData: VariableType) => {
    const sendData: UpdateVariableType = {
      description: formData.description,
      name: formData.name,
      value: formData.value
    }
    updateVariable(sendData)
      .unwrap()
      .then(() => {
        message.success('Переменная успешно обновлена')
        goToVariablePage()
      })
      .catch((error: AxiosError<MSPError>) => {
        handleVariableApiError(error, 'Ошибка при обновлении переменной', {
          setError,
          message
        })
      })
  }

  const handleSubmitForm = (formData: VariableType) => {
    if (isNewVariable) {
      handleCreateVariable(formData)
    } else {
      handleUpdateVariable(formData)
    }
  }

  return (
    <form className="variable-editor">
      <VariableEditorHeader
        isEditPermission={isEditPermission}
        isDirty={isDirty}
        isLoading={isSomeMethodLoading}
        title={isNewVariable ? 'Новая переменная' : variable!.name}
        onSubmit={handleSubmit(handleSubmitForm)}
      />
      <VariableEditorForm
        control={control}
        isNewVariable={isNewVariable}
        isEditPermission={isEditPermission}
        typeWatch={typeWatch}
      />
    </form>
  )
}

export default VariableEditor
