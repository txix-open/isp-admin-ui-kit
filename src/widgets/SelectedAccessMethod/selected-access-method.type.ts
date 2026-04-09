import { AccessListMethodType, EndpointType } from '@type/accessList.type'

export interface SelectedAccessMethodPropsType {
  unknownMethodKey: string
  methods: AccessListMethodType[]
  selectedMethod: AccessListMethodType[]
  allRoutes: Record<string, EndpointType[]>
}
