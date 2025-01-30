import { ConfigType } from '@pages/ModulesPage/module.type.ts'

export interface ActiveTableActionButtonsPropsType {
  isActive: boolean
  record: ConfigType
  handleShowConfig: (record: ConfigType) => void
  handleShowCompareModal: (record: ConfigType) => void
  handleDeleteConfig: (record: ConfigType) => void
  handleMarkConfigActive: (record: ConfigType) => void
}
