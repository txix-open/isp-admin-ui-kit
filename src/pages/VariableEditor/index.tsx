import { Alert, Button, Result, Spin } from 'antd'
import { AxiosError } from 'axios'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import useRole from '@hooks/useRole'

import variablesApi from '@services/variablesService'

import { routePaths } from '@routes/routePaths'

import { MSPError } from '@type/index'
import { PermissionKeysType } from '@type/roles.type'

import VariableEditorContent from './VariableEditorContent'

const VariableEditor = () => {
  const { id = '' } = useParams()
  const { search } = useLocation()
  const navigate = useNavigate()
  const { hasPermission } = useRole()
  const isNew = id === 'new'
  const canAccess = hasPermission(
    isNew ? PermissionKeysType.variable_add : PermissionKeysType.variable_view
  )
  const query = variablesApi.useGetVariableByNameQuery(id, {
    skip: isNew || !canAccess
  })
  const variable = !isNew && query.data?.name === id ? query.data : undefined
  const goToList = () => navigate({ pathname: routePaths.variables, search })

  if (!canAccess) {
    return <Result status="403" title="Нет доступа к этой переменной" />
  }
  if (query.isLoading || (!isNew && query.isFetching && !variable)) {
    return (
      <Spin description="Загрузка переменной">
        <div style={{ minHeight: 160 }} />
      </Spin>
    )
  }
  if (!isNew && !variable) {
    const error = query.error as AxiosError<MSPError>
    const notFound =
      !query.isError ||
      error?.status === 404 ||
      error?.response?.status === 404 ||
      String(error?.response?.data.errorCode) === '2006'
    return (
      <Result
        status={notFound ? '404' : 'error'}
        title={
          notFound ? 'Переменная не найдена' : 'Не удалось загрузить переменную'
        }
        extra={[
          <Button key="back" onClick={goToList}>
            К переменным
          </Button>,
          !notFound && (
            <Button
              key="retry"
              type="primary"
              loading={query.isFetching}
              onClick={() => query.refetch()}
            >
              Повторить
            </Button>
          )
        ]}
      />
    )
  }

  return (
    <div className="variable-editor-page">
      {query.isError && variable && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось обновить данные. Изменения в форме сохранены."
          action={
            <Button loading={query.isFetching} onClick={() => query.refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <VariableEditorContent key={id} variable={variable} />
    </div>
  )
}

export default VariableEditor
