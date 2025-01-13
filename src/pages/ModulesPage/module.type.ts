export interface RequiredModuleType {
  id: string
  name: string
  required: boolean
}

export interface AddressType {
  ip: string
  port: string
}

export interface EndpointType {
  extra: Record<string, unknown>
  inner: boolean
  path: string
  userAuthRequired: boolean
}

export interface ModuleStatusType {
  establishedAt: string
  libVersion: string
  version: string
  address: AddressType
  endpoints: EndpointType[]
}

export interface ConfigType {
  active: boolean
  commonConfigs: string[]
  createdAt: string
  data: Record<string, unknown>
  description: string
  id: string
  moduleId: string
  name: string
  updatedAt: string
  valid: boolean
  version: number
  unsafe?: boolean
}

export interface JSONSchema {
  $ref?: string
  $schema?: string
  additionalItems?: boolean | JSONSchema
  additionalProperties?: boolean | JSONSchema
  allOf?: JSONSchema[]
  anyOf?: JSONSchema[]
  default?: any
  definitions?: Record<string, JSONSchema>
  dependencies?: Record<string, string | string[] | JSONSchema>
  description?: string
  enum?: any[]
  exclusiveMaximum?: boolean
  exclusiveMinimum?: boolean
  format?: string
  items?: JSONSchema | JSONSchema[]
  maxItems?: number
  maxLength?: number
  maxProperties?: number
  maximum?: number
  media?: JSONSchema
  minItems?: number
  minLength?: number
  minProperties?: number
  minimum?: number
  multipleOf?: number
  not?: JSONSchema
  oneOf?: JSONSchema[]
  pattern?: string
  patternProperties?: Record<string, JSONSchema>
  properties?: Record<string, JSONSchema>
  required?: string[]
  title?: string
  type?: string | string[]
  uniqueItems?: boolean
}

export interface ModuleType {
  active: boolean
  configs: ConfigType[]
  createdAt: string
  id: string
  lastConnectedAt: string
  lastDisconnectedAt: string
  name: string
  requiredModules: RequiredModuleType[]
  status: ModuleStatusType[]
  configSchema: JSONSchema
}

export interface ResponseSchemaType {
  createdAt: string
  id: string
  moduleId: string
  schema: JSONSchema
  updatedAt: string
  version: string
}
export interface ConfigResponse {
  originalResponse: ConfigType[]
  activeConfigs: ConfigType[]
  inactiveConfigs: ConfigType[]
}
