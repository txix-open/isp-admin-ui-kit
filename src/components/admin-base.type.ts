import { ConfigProviderProps } from 'antd'

import { CustomMenuItemType } from '@components/Layout/layout.type.ts'

export interface AdminBasePropsType {
  customRouters?: CustomMenuItemType[]
  defaultRoutePath?: string
  configProviderProps?: ConfigProviderProps
}
