import { PlusOutlined, ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, message } from 'antd'
import { useSearchParams } from 'react-router-dom'

import PageLayout, { PageAccessDenied } from '@components/PageLayout'
import VariablesTable from '@components/VariablesComponents/VariablesTable/VariablesTable'

import VariableEditorContent from '@pages/VariableEditor/VariableEditorContent'

import { handleVariableApiError } from '@utils/variableUtils'

import useRole from '@hooks/useRole'

import variablesApi from '@services/variablesService'

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
  const [params, setParams] = useSearchParams()
  const closeCreate = () =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        next.delete('create')
        return next
      },
      { replace: true }
    )
  const openCreate = () =>
    setParams((current) => {
      const next = new URLSearchParams(current)
      next.set('create', 'variable')
      return next
    })

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

  if (!canView) return <PageAccessDenied title="Переменные" />

  return (
    <PageLayout
      title="Переменные"
      className="variables-page"
      description="Общие значения для конфигураций. Значения секретов скрыты и недоступны для поиска."
      actions={
        <>
          <Button
            icon={<ReloadOutlined />}
            loading={query.isFetching}
            onClick={() => query.refetch()}
          >
            Обновить
          </Button>
          {canAdd && (
            <Button
              data-testid="variables-page__header__addButton"
              type="primary"
              icon={<PlusOutlined />}
              disabled={removeState.isLoading}
              onClick={openCreate}
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
            <Button
              icon={<ReloadOutlined />}
              loading={query.isFetching}
              onClick={() => query.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}
      <VariablesTable
        dataTable={query.data ?? []}
        onCreate={canAdd && !removeState.isLoading ? openCreate : undefined}
        loading={query.isFetching}
        unavailable={query.isError && !query.data}
        removingName={
          removeState.isLoading ? removeState.originalArgs : undefined
        }
        onRemoveVariable={handleRemove}
      />
      {canAdd && params.get('create') === 'variable' && (
        <VariableEditorContent onClose={closeCreate} />
      )}
    </PageLayout>
  )
}

export default VariablesPage
