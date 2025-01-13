import { useMemo } from 'react'

import { PermissionKeysType } from '@type/roles.type.ts'

import { useAppSelector } from './redux.ts'

export const useRole = () => {
  const { profile } = useAppSelector((state: any) => state.profileReducer)
  const role: string = useMemo(() => profile && profile.role, [profile])

  const hasPermission = (permission: PermissionKeysType) => {
    const userPermission = profile.permissions || []
    return userPermission.includes(permission)
  }

  return { role, hasPermission }
}

export default useRole
