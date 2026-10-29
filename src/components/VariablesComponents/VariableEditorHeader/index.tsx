import { Button } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageHeader } from '@components/PageLayout'

import { routePaths } from '@routes/routePaths'

import { VariableEditorHeaderPropsType } from './variable-editor-header.type'

const VariableEditorHeader = ({
  title,
  isNewVariable,
  isLoading,
  isDirty,
  isEditPermission
}: VariableEditorHeaderPropsType) => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const operation = isNewVariable
    ? 'Создание переменной'
    : isEditPermission
      ? 'Редактирование переменной'
      : 'Просмотр переменной'

  return (
    <PageHeader
      className="variable-editor-header"
      title={title}
      context={operation}
      focusOnMount
      back={
        <Button
          data-testid="variable-editor-header__back-btn"
          disabled={isLoading}
          onClick={() => navigate({ pathname: routePaths.variables, search })}
        >
          К переменным
        </Button>
      }
      actions={
        isEditPermission && (
          <Button
            data-testid="variable-editor-header__save-btn"
            type="primary"
            loading={isLoading}
            htmlType="submit"
            disabled={!isDirty || isLoading}
          >
            Сохранить
          </Button>
        )
      }
    />
  )
}

export default VariableEditorHeader
