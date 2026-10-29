import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button, message, Result } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import PageLayout from '@components/PageLayout'
import VariablesTable from '@components/VariablesComponents/VariablesTable/VariablesTable'

import { handleVariableApiError } from '@utils/variableUtils'

import useRole from '@hooks/useRole'

import variablesApi from '@services/variablesService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

const VariablesPage = () => {
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.variable_view)
  const canAdd = hasPermission(PermissionKeysType.variable_add)
  const canRemove = hasPermission(PermissionKeysType.variable_delete)
  const query = variablesApi.useGetAllVariablesQuery(undefined, {
    skip: !canView
  })
  const [removeVariable, removeState] = variablesApi.useDeleteVariableMutation()
  const navigate = useNavigate()
  const { search } = useLocation()

  const handleRemove = (name: string) => {
    if (!canRemove || removeState.isLoading) return
    return removeVariable(name)
      .unwrap()
      .then(() => {
        message.success(`Переменная «${name}» удалена`)
      })
      .catch((error) => {
        handleVariableApiError(error, `Не удалось удалить переменную «${name}»`)
      })
  }

  if (!canView) return <Result status="403" title="Нет доступа к переменным" />

  return (
    <PageLayout
      title="Переменные"
      className="variables-page"
      description="Общие значения для конфигураций. Значения секретов скрыты и недоступны для поиска."
      actions={
        <>
          <Button loading={query.isFetching} onClick={() => query.refetch()}>
            Обновить
          </Button>
          {canAdd && (
            <Button
              data-testid="variables-page__header__addButton"
              type="primary"
              icon={<PlusOutlined />}
              disabled={removeState.isLoading}
              onClick={() =>
                navigate({ pathname: `${routePaths.variables}/new`, search })
              }
            >
              Новая переменная
            </Button>
          )}
        </>
      }
    >
      {query.isError && (
        <Alert
          type="error"
          showIcon
          title={
            query.data
              ? 'Не удалось обновить переменные. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить переменные'
          }
          action={
            <Button loading={query.isFetching} onClick={() => query.refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <VariablesTable
        dataTable={query.data ?? []}
        loading={query.isFetching}
        unavailable={query.isError && !query.data}
        removingName={
          removeState.isLoading ? removeState.originalArgs : undefined
        }
        onRemoveVariable={handleRemove}
      />
    </PageLayout>
  )
}

export default VariablesPage
