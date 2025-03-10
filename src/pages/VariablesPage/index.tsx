import { PlusSquareOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import { AxiosError } from 'axios'
import { Navigate, useNavigate } from 'react-router-dom'

import VariablesTable from '@components/VariablesComponents/VariablesTable/VariablesTable.tsx'

import { handleVariableApiError } from '@utils/variableUtils.ts'

import variablesApi from '@services/variablesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { MSPError } from '@type/index.ts'

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
        <Button
          data-cy="variables-page__header__addButton"
          type="primary"
          icon={<PlusSquareOutlined />}
          onClick={() => navigate(`${routePaths.variables}/new`)}
        >
          Добавить
        </Button>
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
