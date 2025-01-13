export interface AccessListMethodType {
  method: string
  value: boolean
}

export interface AccessListSetListRequestType {
  appId: number
  methods: AccessListMethodType[]
  removeOld?: boolean
}

export interface AccessListSetListSetOneRequestType {
  appId: number
  method: string
  value: boolean
}

export interface EndpointType {
  extra: Record<string, any>
  inner: boolean
  path: string
  userAuthRequired: boolean
}

export type AddressType = {
  ip: string
  port: string
}

export type RequiredModuleType = {
  name: string
  required: boolean
}

export type RouteType = {
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
