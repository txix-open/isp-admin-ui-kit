import {
  FormInput,
  FormRadioGroup,
  FormTextArea,
  FormSecretTextArea,
  LabelItem
} from 'isp-ui-kit'
import { Path } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules.ts'

import { VariableEditorFormPropsType } from './variable-editor-form.type.ts'

import './variable-editor-form.scss'

const radioGroupOptions: LabelItem[] = [
  { label: 'SECRET', value: 'SECRET' },
  { label: 'TEXT', value: 'TEXT' }
]
const VariableEditorForm = ({
  control,
  isNewVariable,
  isEditPermission,
  typeWatch
}: VariableEditorFormPropsType) => {
  const getRulesProps = (fieldName: Path<VariableType>) => ({
    rules: {
      required: ValidationRules.required,
      ...(fieldName === 'name' && {
        pattern: {
          value: /^[a-zA-Z_][a-zA-Z0-9_]*$/,
          message:
            'Имя переменной должно начинаться с буквы или `_` и содержать только буквы, цифры и `_`.'
        }
      })
    }
  })

  return (
    <main className="variable-editor-form">
      <FormInput
        data-testid="variable-editor-form__name-input"
        label="Наименование"
        control={control}
        name="name"
        disabled={!isNewVariable || !isEditPermission}
        {...getRulesProps('name')}
      />
      <FormTextArea
        data-testid="variable-editor-form__description-input"
        label="Описание"
        control={control}
        name="description"
        autoSize={{ minRows: 2, maxRows: 6 }}
        disabled={!isEditPermission}
      />
      <FormRadioGroup
        data-testid="variable-editor-form__type-input"
        type="button"
        buttonStyle="solid"
        label="Тип"
        name="type"
        items={radioGroupOptions}
        control={control}
        disabled={!isNewVariable || !isEditPermission}
      />
      {typeWatch === 'SECRET' ? (
        <FormSecretTextArea
          data-testid="variable-editor-form__value-input"
          label="Значение"
          control={control}
          name="value"
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={!isEditPermission}
          formItemProps={{
            help: 'Значение секрета недоступно для чтения после сохранения переменной. Сохраните или запомните значение.'
          }}
          {...getRulesProps('value')}
        />
      ) : (
        <FormTextArea
          data-testid="variable-editor-form__value-input"
          label="Значение"
          control={control}
          name="value"
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={!isEditPermission}
          {...getRulesProps('value')}
        />
      )}
    </main>
  )
}

export default VariableEditorForm
