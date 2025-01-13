export enum SessionStatusKeysType {
  allowed = 'ALLOWED',
  revoked = 'REVOKED',
  expired = 'EXPIRED'
}

export const sessionStatuses: Record<SessionStatusKeysType, string> = {
  [SessionStatusKeysType.allowed]: 'Активная',
  [SessionStatusKeysType.revoked]: 'Отмененная',
  [SessionStatusKeysType.expired]: 'Истекшая'
}
