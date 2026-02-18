import { ModalPropsType } from '@widgets/Modal/modal.type'

export interface CompareVersionModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  config: Record<string, any>
  currentConfigId: string
}
