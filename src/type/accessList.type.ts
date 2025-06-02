interface WithAppId {
  appId: number
}

interface AccessListMethodTypeBase {
  method: string
  value: boolean
}

export interface AccessListMethodType extends AccessListMethodTypeBase {}

export interface AccessListSetListRequestType extends WithAppId {
  methods: AccessListMethodType[]
  removeOld?: boolean
}

export interface AccessListSetListSetOneRequestType
  extends WithAppId,
    AccessListMethodTypeBase {}

export interface AccessListDeleteListRequestType extends WithAppId {
  methods: string[]
}

export interface EndpointType {
  extra: Record<string, any>
  inner: boolean
  path: string
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
