import { FormComponents, LabelItem } from 'isp-ui-kit'

import { ValidationRules } from '@constants/form/validationRules.ts'

import { VariableEditorFormPropsType } from './variable-editor-form.type.ts'

import './variable-editor-form.scss'

const { FormInput, FormRadioGroup, FormTextArea, FormSecretTextArea } =
  FormComponents

const radioGroupOptions: LabelItem[] = [
  { label: 'SECRET', value: 'SECRET' },
  { label: 'TEXT', value: 'TEXT' }
]
const VariableEditorForm = ({
  control,
  isNewVariable,
  typeWatch
}: VariableEditorFormPropsType) => {
  const getRulesProps = () => ({
    rules: {
      required: ValidationRules.required
    }
  })

  return (
    <main className="variable-editor-form">
      <FormInput
        label="Наименование"
        control={control}
        name="name"
        disabled={!isNewVariable}
        {...getRulesProps()}
      />
      <FormTextArea
        label="Описание"
        control={control}
        name="description"
        autoSize={{ minRows: 2, maxRows: 6 }}
      />
      <FormRadioGroup
        type="button"
        buttonStyle="solid"
        label="Тип"
        name="type"
        items={radioGroupOptions}
        control={control}
        disabled={!isNewVariable}
      />
      {typeWatch === 'SECRET' ? (
        <FormSecretTextArea
          label="Значение"
          control={control}
          name="value"
          autoSize={{ minRows: 2, maxRows: 6 }}
          {...getRulesProps()}
        />
      ) : (
        <FormTextArea
          label="Значение"
          control={control}
          name="value"
          autoSize={{ minRows: 2, maxRows: 6 }}
          {...getRulesProps()}
        />
      )}
    </main>
  )
}

export default VariableEditorForm
