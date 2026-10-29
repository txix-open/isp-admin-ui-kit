import { TableProps } from 'antd'

export interface VariablesTablePropsType {
  dataTable: VariableType[]
  onRemoveVariable: (variableName: string) => void | Promise<void>
  loading?: boolean
  unavailable?: boolean
  removingName?: string
}

export type OnChange = NonNullable<TableProps<VariableType>['onChange']>
export type Filters = Parameters<OnChange>[1]

export type GetSingle<T> = T extends (infer U)[] ? U : never
export type Sorts = GetSingle<Parameters<OnChange>[2]>
