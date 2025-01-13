import { SessionStatusKeysType } from '@constants/statuses'

export interface SessionType {
  userId: string
  createdAt: string
  expiredAt: string
  id: number
  status: SessionStatusKeysType
}

export interface SessionResponseType {
  totalCount: number
  items: SessionType[]
}
