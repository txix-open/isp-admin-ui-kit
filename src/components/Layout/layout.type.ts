import { ReactNode } from 'react'

export interface LayoutComponentPropsType extends RoutersPropsType {}

export interface CustomMenuItemType {
  label: string
  key: string
  className?: string
  permissions: string[]
  /** Defaults to `any` for compatibility with existing menus. */
  permissionMode?: 'any' | 'all'
  /** Defaults to own permissions; `children` shows a group by its children. */
  visibilityMode?: 'permissions' | 'children'
  requiredModules?: string[]
  icon?: ReactNode
  route?: string | string[]
  element?: any
  children?: CustomMenuItemType[]
}

export interface RoutersPropsType {
  customRouters: CustomMenuItemType[]
}
