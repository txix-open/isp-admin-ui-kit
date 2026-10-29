import { ModalPropsType } from '@widgets/Modal/modal.type'

import { VersionType } from '@type/version.type'

export interface CompareVersionModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  versions: [VersionType, VersionType]
  configName?: string
}
