import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

export interface ConfigurationPreviewModalPropsType
  extends Omit<ModalPropsType, 'title' | 'children'> {
  config: Record<string, any>
  versionCompare?: boolean
}
