import { ModalPropsType } from '@widgets/Modal/modal.type'

interface ChangesType {
  allowed: string[]
  denied: string[]
}

export interface SaveModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  changes: ChangesType
}
