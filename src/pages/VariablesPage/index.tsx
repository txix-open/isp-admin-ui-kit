import { PlusSquareOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import { AxiosError } from 'axios'
import { useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import VariablesTable from '@components/VariablesComponents/VariablesTable/VariablesTable.tsx'

import { handleVariableApiError } from '@utils/variableUtils.ts'

import useRole from '@hooks/useRole.tsx'

import variablesApi from '@services/variablesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { MSPError } from '@type/index.ts'
import { PermissionKeysType } from '@type/roles.type.ts'

import './variables-page.scss'

const VariablesPage = () => {
  const [messageApi, contextHolder] = message.useMessage()
  const messageKey = 'removeVariableKey'
  const {
    data: variables = [],
    isLoading,
    isError
  } = variablesApi.useGetAllVariablesQuery()

  const [removeVariable] = variablesApi.useDeleteVariableMutation()

  const navigate = useNavigate()

  const { role, hasPermission } = useRole()
  const isPageAvailable = hasPermission(PermissionKeysType.variable_view)
  const canAddVariable = hasPermission(PermissionKeysType.variable_add)

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  if (isLoading) {
    return <Spin fullscreen />
  }

  if (isError) {
    return <Navigate to={routePaths.error} />
  }

  const handleRemoveVariable = (variableName: string) => {
    messageApi.open({
      key: messageKey,
      type: 'loading',
      content: `Удаление переменной "${variableName}"`
    })
    removeVariable(variableName)
      .unwrap()
      .then(() => {
        messageApi.open({
          key: messageKey,
          type: 'success',
          content: `Переменная "${variableName}" успешно удалена`
        })
      })
      .catch((err: AxiosError<MSPError>) => {
        handleVariableApiError(
          err,
          `Произошла ошибка удаления переменной "${variableName}"`,
          { message }
        )
      })
  }

  return (
    <section className="variables-page">
      {contextHolder}
      <header className="variables-page__header">
        <span
          data-testid="variables-page__header__title"
          className="variables-page__header__title"
        >
          Переменные
        </span>
        {canAddVariable && (
          <Button
            data-testid="variables-page__header__addButton"
            type="primary"
            icon={<PlusSquareOutlined />}
            onClick={() => navigate(`${routePaths.variables}/new`)}
          >
            Добавить
          </Button>
        )}
      </header>
      <div className="variables-page__content">
        <VariablesTable
          dataTable={variables}
          onRemoveVariable={handleRemoveVariable}
        />
      </div>
    </section>
  )
}

export default VariablesPage
