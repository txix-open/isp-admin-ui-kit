interface TokenType {
  appId: boolean
  createdAt: string
  expireTime: boolean
  token: string
}

export interface SystemTreeAppType {
  description: string
  id: boolean
  name: string
  tokens: TokenType[]
  type: string
}

interface SystemServiceType {
  apps: SystemTreeAppType[]
  description: string
  id: boolean
  name: string
}

export interface DomainType {
  description: string
  id: boolean
  name: string
  services: SystemServiceType[]
}

export interface AppApiResponseType {
  originalResponse: DomainType[]
  appList: SystemTreeAppType[]
}
