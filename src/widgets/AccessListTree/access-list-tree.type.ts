import { TreeProps } from 'antd'

import { AccessListMethodType, EndpointType } from '@type/accessList.type.ts'

export interface AccessListTreePropsType {
  searchValue: string
  defaultAllRoutes: Record<string, EndpointType[]>
  methods: AccessListMethodType[]
  onCheck: TreeProps['onCheck']
}
