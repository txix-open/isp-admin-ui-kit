import { ConfigType, ModuleType } from '@pages/ModulesPage/module.type.ts'

export interface ActiveConfigurationsTablePropsType {
  isActiveTable?: boolean
  data: ConfigType[]
  handleShowConfig: (config: ConfigType) => void
  handleShowCompareModal: (config: ConfigType) => void
  currentModule?: ModuleType
}
