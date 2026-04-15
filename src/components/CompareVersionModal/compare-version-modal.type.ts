import { ModalPropsType } from '@widgets/Modal/modal.type'

import { ConfigType } from '@pages/ModulesPage/module.type'

import { VersionType } from '@type/version.type'

export interface CompareVersionModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  config?: VersionType
  currentConfig: ConfigType
}
