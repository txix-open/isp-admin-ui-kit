import { ModuleType } from '@pages/ModulesPage/module.type'

export type SetConfigNameModalProps = {
  open: boolean
  onClose: () => void
  currentModule?: ModuleType
}

export type ConfigNameFormType = {
  name: string
}
