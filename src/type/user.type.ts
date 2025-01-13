export interface UserType {
  id: number
  blocked: boolean
  createdAt: string
  email: string
  password: string
  firstName: string
  lastName: string
  roleId: number
  roleName: string
  roles: number[]
  updatedAt: string
  description: string
  lastSessionCreatedAt?: string
}

export interface UserResponseType {
  items: UserType[]
}

export interface NewUserType {
  description: string
  email: string
  firstName: string
  lastName: string
  password: string
  roles: number[]
}
