import { ReactNode } from 'react'

export interface LayoutComponentPropsType extends RoutersPropsType {}

export interface CustomMenuItemType {
  label: string
  key: string
  className?: string
  permissions: string[]
  icon?: ReactNode
  route?: string | string[]
  element?: any
  children?: CustomMenuItemType[]
}

export interface RoutersPropsType {
  customRouters: CustomMenuItemType[]
}
