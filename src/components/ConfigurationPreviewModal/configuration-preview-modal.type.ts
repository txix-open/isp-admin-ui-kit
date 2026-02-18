import { ModalPropsType } from '@widgets/Modal/modal.type'

export interface ConfigurationPreviewModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  config: Record<string, any>
  versionCompare?: boolean
}
