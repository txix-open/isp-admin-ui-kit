import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

interface ChangesType {
  allowed: string[]
  denied: string[]
}

export interface SaveModalPropsType
  extends Omit<ModalPropsType, 'title' | 'children'> {
  changes: ChangesType
}
