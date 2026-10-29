import { ConfigType, ModuleType } from '@pages/ModulesPage/module.type'

export interface ActiveConfigurationsTablePropsType {
  loading?: boolean
  loadFailed?: boolean
  isActiveTable?: boolean
  data: ConfigType[]
  handleShowConfig: (config: ConfigType) => void
  currentModule?: ModuleType
}
