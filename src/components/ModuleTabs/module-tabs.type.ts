import { ModuleType } from '@pages/ModulesPage/module.type.ts'

export interface ModuleTabsPropsType {
  activeTab: string
  setActiveTab: (key: string) => void
  currentModule: ModuleType | undefined
}
