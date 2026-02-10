import { useContext, useMemo } from 'react'

import { Context } from '@stores/index'

import { PermissionKeysType } from '@type/roles.type'

import { useAppSelector } from './redux'

export const useRole = () => {
  const { excludePermissions } = useContext(Context)
  const { profile } = useAppSelector((state: any) => state.profileReducer)
  const role: string = useMemo(() => profile && profile.role, [profile])

  const hasPermission = (permission: string) => {
    if (excludePermissions.includes(permission as PermissionKeysType)) {
      return false
    }
    const userPermission = profile.permissions || []
    return userPermission.includes(permission)
  }

  return { role, hasPermission }
}

export default useRole
