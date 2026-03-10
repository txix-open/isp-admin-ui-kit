interface WithAppId {
  appId: number
}

export interface AccessListMethodTypeBase {
  method: string
  value: boolean
  httpMethod?: string
}

type AccessListBaseType = Omit<AccessListMethodTypeBase, 'value'>

export interface AccessListMethodType extends AccessListMethodTypeBase {}

export interface AccessListSetListRequestType extends WithAppId {
  methods: AccessListMethodType[]
  removeOld?: boolean
}

export interface AccessListSetListSetOneRequestType
  extends WithAppId, AccessListMethodTypeBase {}

export interface AccessListDeleteListRequestType extends WithAppId {
  methods: AccessListBaseType[]
}

export type BaseEndpoint = {
  path: string
  httpMethod: string
}

export type EndpointType = BaseEndpoint & {
  extra: Record<string, any>
  inner: boolean
  userAuthRequired: boolean
}

export interface AddressType {
  ip: string
  port: string
}

export interface RequiredModuleType {
  name: string
  required: boolean
}

export interface RouteType {
  address: AddressType
  endpoints: EndpointType[]
  libVersion: string
  moduleName: string
  requiredModules: RequiredModuleType[]
  version: string
}

export interface RouteApiResponseType {
  originalResponse: RouteType[]
  moduleEndpoints: Record<string, EndpointType[]>
  allRouteMap: Record<string, EndpointType>
}
