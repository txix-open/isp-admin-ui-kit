import { ConfigProviderProps } from 'antd'

import { CustomMenuItemType } from '@components/Layout/layout.type'

import { PermissionKeysType } from '@type/roles.type'

export interface AdminBasePropsType {
  customRouters?: CustomMenuItemType[]
  defaultRoutePath?: string
  configProviderProps?: ConfigProviderProps
  excludePermissions?: PermissionKeysType[]
}
