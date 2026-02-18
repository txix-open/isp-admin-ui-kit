import { ModuleType } from '@pages/ModulesPage/module.type'

export interface ModuleTabsPropsType {
  activeTab: string
  setActiveTab: (key: string) => void
  currentModule: ModuleType | undefined
  searchParams: URLSearchParams
}
