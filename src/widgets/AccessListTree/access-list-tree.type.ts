import { TreeProps } from 'antd'

import { AccessListMethodType, EndpointType } from '@type/accessList.type'

export interface AccessListTreePropsType {
  searchValue: string
  defaultAllRoutes: Record<string, EndpointType[]>
  methods: AccessListMethodType[]
  onCheck: TreeProps['onCheck']
  selectedMethod: AccessListMethodType[]
  onRemoveUnknownMethods?: (methods: string[]) => void
}
