export interface LogResponseType {
  totalCount: number
  items: LogType[]
}

export interface LogType {
  id: string
  userId: string
  createdAt: string
  message: string
}

export type LogEventKeyType =
  | 'login_logout'
  | 'role_changed'
  | 'user_changed'
  | 'user_blocked'

export interface LogEventType {
  event: LogEventKeyType
  name: string
  enabled: boolean
}

export type SetEventType = Omit<LogEventType, 'name'>
