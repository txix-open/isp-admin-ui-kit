import { ModuleType } from '@pages/ModulesPage/module.type.ts'

export interface ModuleTabContentPropsType {
  selectedItemId: string
  currentModule: ModuleType | undefined
}
