export interface ApplicationsGroupType {
  createdAt: string
  description: string
  domainId: number
  id: number
  name: string
  updatedAt: string
}

export type NewApplicationsGroupType = Omit<
  ApplicationsGroupType,
  'id' | 'createdAt' | 'updatedAt'
>
export type UpdateApplicationsGroupType = Omit<
  ApplicationsGroupType,
  'createdAt' | 'updatedAt'
>

export interface ApplicationsServiceType {
  app: ApplicationAppType
  tokens: ApplicationTokenType[]
}

export type NewApplicationTokenType = {
  appId: number
  expireTimeMs: number
}

export interface ApplicationAppType {
  createdAt: string
  description: string
  id: number
  name: string
  applicationGroupId: number
  type: string
  updatedAt: string
  serviceId: number
}

export interface UpdateApplicationAppType {
  description: string
  name: string
  newId: number
  oldId: number
}

export type NewApplicationAppType = Omit<
  ApplicationAppType,
  'createdAt' | 'updatedAt' | 'serviceId'
>
export type RevokeTokenType = {
  appId: number
  tokens: string[]
}

export interface ApplicationTokenType {
  appId: number
  createdAt: string
  expireTime: number
  token: string
}
