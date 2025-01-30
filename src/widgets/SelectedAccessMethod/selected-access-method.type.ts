import { AccessListMethodType, EndpointType } from '@type/accessList.type.ts'

export interface SelectedAccessMethodPropsType {
  unknownMethodKey: string
  methods: AccessListMethodType[]
  allRoutes: Record<string, EndpointType[]>
}
