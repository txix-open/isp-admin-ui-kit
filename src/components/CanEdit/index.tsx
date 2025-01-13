import { PropsWithChildren } from 'react'

import { useRole } from '@hooks/useRole.tsx'

import { PermissionKeysType } from '@type/roles.type.ts'

const CanEdit = ({ children }: PropsWithChildren) => {
  const { hasPermission } = useRole()

  if (hasPermission(PermissionKeysType.write)) {
    return <>{children}</>
  }
  return null
}

export default CanEdit
