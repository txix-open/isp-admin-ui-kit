import { TreeProps } from 'antd'

import { AccessListMethodType, BaseEndpoint, EndpointType } from '@type/accessList.type'

export interface AccessListTreePropsType {
  searchValue: string
  defaultAllRoutes: Record<string, EndpointType[]>
  methods: AccessListMethodType[]
  onCheck: TreeProps['onCheck']
  selectedMethod: AccessListMethodType[]
  selectedHttpMethods: string[]
  showChangedOnly: boolean
  onRemoveUnknownMethods?: (methods: BaseEndpoint[]) => void
}
