import { ConfigType } from '@pages/ModulesPage/module.type'

export interface ActiveTableActionButtonsPropsType {
  isActive: boolean
  record: ConfigType
  isDeleting: boolean
  handleDeleteConfig: (record: ConfigType) => Promise<void> | undefined
  handleMarkConfigActive: (record: ConfigType) => void
}
