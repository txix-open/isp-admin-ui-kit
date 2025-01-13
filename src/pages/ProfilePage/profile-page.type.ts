import { StateProfileStatus } from '@stores/redusers/ProfileSlice.ts'

export type ProfileDataType = {
  email: string
  firstName: string
  lastName: string
  role: string
  roles: number[]
  permissions: string[]
  idleTimeoutMs: number
}

export type ProfileType = {
  profile: ProfileDataType
  status: StateProfileStatus
  error: string
}

export type ChangeProfilePassword = {
  oldPassword: string
  newPassword: string
}

export type UIDataType = {
  name: string
  primaryColor: string
}

export type UIType = {
  ui: UIDataType
  status: StateProfileStatus
  error: string
}
