import { ModuleType } from '@pages/ModulesPage/module.type.ts'

export type SetConfigNameModalProps = {
  open: boolean
  onClose: () => void
  currentModule?: ModuleType
}
