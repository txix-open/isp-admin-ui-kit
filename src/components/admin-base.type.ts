import { CustomMenuItemType } from '@type/app.type.ts'
import { ConfigProviderProps } from 'antd'

export interface AdminBasePropsType {
  customRouters?: CustomMenuItemType[]
  configProviderProps?: ConfigProviderProps
}
