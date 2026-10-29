import {
  FormInput,
  FormRadioGroup,
  FormTextArea,
  FormSecretTextArea,
  LabelItem
} from 'isp-ui-kit'
import { Path } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import './variable-editor-form.scss'
import { VariableEditorFormPropsType } from './variable-editor-form.type'

const radioGroupOptions: LabelItem[] = [
  { label: 'Текст', value: 'TEXT' },
  { label: 'Секрет', value: 'SECRET' }
]
const VariableEditorForm = ({
  control,
  isNewVariable,
  isEditPermission,
  typeWatch,
  isSaving = false
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
    <section className="variable-editor-form" aria-label="Параметры переменной">
      <div className="variable-editor-form__fields">
        <div className="variable-editor-form__identity">
          <FormInput
            data-testid="variable-editor-form__name-input"
            label="Имя переменной"
            placeholder="Например, APP_TIMEOUT"
            control={control}
            name="name"
            disabled={!isNewVariable || !isEditPermission || isSaving}
            formItemProps={{
              extra: isNewVariable
                ? 'Латинские буквы, цифры и _. Начните с буквы или _.'
                : 'Имя и тип задаются при создании.'
            }}
            {...getRulesProps('name')}
          />
          <FormRadioGroup
            data-testid="variable-editor-form__type-input"
            type="button"
            buttonStyle="solid"
            label="Тип"
            name="type"
            items={radioGroupOptions}
            control={control}
            disabled={!isNewVariable || !isEditPermission || isSaving}
          />
        </div>
        <FormTextArea
          data-testid="variable-editor-form__description-input"
          label="Описание"
          control={control}
          name="description"
          autoSize={{ minRows: 2, maxRows: 6 }}
          disabled={!isEditPermission || isSaving}
        />
        {typeWatch === 'SECRET' ? (
          <FormSecretTextArea
            data-testid="variable-editor-form__value-input"
            label={
              isNewVariable || !isEditPermission
                ? 'Значение секрета'
                : 'Новое значение секрета'
            }
            control={control}
            name="value"
            autoSize={{ minRows: 2, maxRows: 6 }}
            disabled={!isEditPermission || isSaving}
            formItemProps={{
              help: !isEditPermission
                ? 'Сохранённое значение секрета недоступно для чтения.'
                : isNewVariable
                  ? 'После сохранения прочитать значение секрета будет нельзя.'
                  : 'Сохранённое значение недоступно для чтения. Для замены введите новое.'
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
            disabled={!isEditPermission || isSaving}
            {...getRulesProps('value')}
          />
        )}
      </div>
    </section>
  )
}

export default VariableEditorForm
