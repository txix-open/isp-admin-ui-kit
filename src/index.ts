import { useRole } from '@entries/hooks'
import {
  axiosBaseQuery,
  filterFirstColumnItems,
  sortObject
} from '@entries/utils'

import AdminBase from '@components/AdminBase'

import ModuleGuard, {
  ModuleGuardFallbackType,
  ModuleGuardPropsType
} from '@routes/ModuleGuard'

import { PermissionKeysType } from '@type/roles.type'

import {
  baseApiServices,
  baseSetupStore,
  Context as AdminBaseContext
} from './stores'

export {
  AdminBase,
  baseApiServices,
  baseSetupStore,
  AdminBaseContext,
  useRole,
  filterFirstColumnItems,
  PermissionKeysType,
  sortObject,
  axiosBaseQuery,
  ModuleGuard,
  ModuleGuardFallbackType,
  ModuleGuardPropsType
}
