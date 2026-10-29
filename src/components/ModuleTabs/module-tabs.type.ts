import { ModuleType } from '@pages/ModulesPage/module.type'

export interface ModuleTabsPropsType {
  activeTab: string
  currentModule: ModuleType | undefined
  searchParams: URLSearchParams
}
