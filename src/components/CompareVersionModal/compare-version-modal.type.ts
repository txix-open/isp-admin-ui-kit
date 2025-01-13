import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

export interface CompareVersionModalPropsType
  extends Omit<ModalPropsType, 'title' | 'children'> {
  config: Record<string, any>
  currentConfigId: string
}
