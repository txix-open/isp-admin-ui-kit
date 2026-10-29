import { ButtonProps } from 'antd'
import { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react'

import { ConfigType, ResponseSchemaType } from '@pages/ModulesPage/module.type'

export interface ConfigurationEditorPropsType {
  jsonSchema?: ResponseSchemaType
  bufConfig: ConfigType
  setBufConfig: Dispatch<SetStateAction<ConfigType | undefined>>
  isCurrentConfigLoading: boolean
  setDisableBtn?: Dispatch<SetStateAction<boolean>>
  disabled?: boolean
}

export interface DescriptionPropsType {
  description?: string
}

export interface Schema {
  type: string
  dynamic?: boolean
}

export interface FieldTemplatePropsType {
  id: string
  classNames?: string
  label?: string
  rawHelp?: string
  required?: boolean
  rawDescription?: string
  rawErrors?: string[]
  children: ReactNode
  displayLabel?: boolean
  schema: Schema
}

export interface ArrayFieldTemplatePropsType {
  items: ReactNode[]
  onAddClick: (event: MouseEvent) => void
  canAdd: boolean
  disabled?: boolean
  readonly?: boolean
  title: string
  titleField?: ComponentType<any>
  fieldPathId?: { $id: string }
  idSchema?: { $id: string }
  schema: { description?: string }
}

export interface ArrayFieldItemTemplatePropsType {
  children: ReactNode
  itemKey?: string
  index: number
  hasToolbar?: boolean
  buttonsProps?: {
    hasRemove?: boolean
    disabled?: boolean
    readonly?: boolean
    onRemoveItem?: (event?: any) => void
  }
}

export interface ObjectFieldTemplatePropertyType {
  name: string
  content: ReactNode
}

export interface SchemaPropertiesType {
  [key: string]: {
    type?: string
    title?: string
  }
}

export interface ObjectFieldTemplatePropsType {
  properties: ObjectFieldTemplatePropertyType[]
  fieldPathId?: {
    $id: string
  }
  idSchema?: {
    $id: string
  }
  schema: {
    description?: string
    properties?: SchemaPropertiesType
    additionalProperties?: boolean | { type: string }
  }
  onAddClick?: (schema: any) => () => void
  onAddProperty?: () => void
  title: string
  disabled?: boolean
  readonly?: boolean
  activeTabKey?: string
  handleTabsChange?: (key: string) => void
}

export interface RemoveButtonProps extends ButtonProps {
  icon?: ReactNode
  iconType?: string
}

export interface ErrorsObjType {
  message: string
  name: string
  params: {
    missingProperty?: string
  }
  property: string
  schemaPath: string
  stack: string
}

export interface SortPropType {
  name: string
}
