import {
  ComponentType,
  Dispatch,
  MutableRefObject,
  ReactNode,
  SetStateAction
} from 'react'
import { ButtonProps } from 'antd'

import {
  ConfigType,
  ResponseSchemaType
} from '@pages/ModulesPage/module.type.ts'

export interface ConfigurationEditorPropsType {
  jsonSchema?: ResponseSchemaType
  bufConfig: ConfigType
  setBufConfig: Dispatch<SetStateAction<ConfigType | undefined>>
  isCurrentConfigLoading: boolean
  setDisableBtn?: Dispatch<SetStateAction<boolean>>
  submitRef?: MutableRefObject<null>
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
  items: {
    index: number
    children: ReactNode
    onDropIndexClick: (index: number) => () => void
  }[]
  onAddClick: (event: MouseEvent) => void
  canAdd: boolean
  title: string
  titleField?: ComponentType<any>
  idSchema: { $id: string }
  schema: { description?: string }
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
  idSchema: {
    $id: string
  }
  schema: {
    properties: SchemaPropertiesType,
    additionalProperties: boolean | {type: string}
  },
  onAddClick: (schema: any) => () => void,
  title: string,
  activeTabKey: string
  handleTabsChange: (key: string) => void
}

export interface RemoveButtonProps extends ButtonProps {
  icon?: ReactNode;
  iconType?: string;
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
