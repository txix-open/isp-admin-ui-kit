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

export { default as PageLayout, PageHeader } from '@components/PageLayout'
export type { PageLayoutProps, PageHeaderProps } from '@components/PageLayout'
export { notifyApiError, ignoreApiError } from '@utils/apiErrorNotifications'

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
