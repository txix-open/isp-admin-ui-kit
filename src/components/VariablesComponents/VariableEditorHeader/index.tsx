import { Button } from 'antd'
import { useNavigate } from 'react-router-dom'

import { routePaths } from '@routes/routePaths'

import { VariableEditorHeaderPropsType } from './variable-editor-header.type.ts'

import './variable-editor-header.scss'

const VariableEditorHeader = ({
  title,
  onSubmit,
  isLoading,
  isDirty,
  isEditPermission
}: VariableEditorHeaderPropsType) => {
  const navigate = useNavigate()

  return (
    <header className="variable-editor-header">
      <div className="variable-editor-header__title-wrapper">
        <Button
          data-testid="variable-editor-header__back-btn"
          onClick={() => navigate(routePaths.variables)}
        >
          Назад
        </Button>
        <h2>{title}</h2>
      </div>
      {isEditPermission && (
        <Button
          data-testid="variable-editor-header__save-btn"
          type="primary"
          loading={isLoading}
          onClick={onSubmit}
          disabled={!isDirty}
        >
          Сохранить
        </Button>
      )}
    </header>
  )
}

export default VariableEditorHeader
