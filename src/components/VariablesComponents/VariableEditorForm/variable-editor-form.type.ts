import { Control } from 'react-hook-form'

export interface VariableEditorFormPropsType {
  control: Control<VariableType>
  isNewVariable: boolean
  isEditPermission: boolean
  typeWatch: string
}
