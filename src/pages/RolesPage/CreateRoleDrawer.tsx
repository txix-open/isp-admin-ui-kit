import { useState } from 'react'

import EntityDrawer from '@components/EntityDrawer'
import RolesContent from '@components/RolesContent'
import { RolesContentPropsType } from '@components/RolesContent/roles-content.type'

interface CreateRoleDrawerProps {
  open: boolean
  onClose: () => void
  permissions: RolesContentPropsType['permissions']
  saveRole: RolesContentPropsType['saveRole']
}

const CreateRoleDrawer = ({
  open,
  onClose,
  permissions,
  saveRole
}: CreateRoleDrawerProps) => {
  const [isSaving, setIsSaving] = useState(false)
  const close = () => {
    if (!isSaving) onClose()
  }
  const save: RolesContentPropsType['saveRole'] = (
    values,
    setError,
    onSaved
  ) => {
    setIsSaving(true)
    return saveRole(values, setError, onSaved).finally(() => setIsSaving(false))
  }

  return (
    <EntityDrawer
      title="Новая роль"
      open={open}
      onClose={close}
      busy={isSaving}
    >
      <RolesContent
        title="Новая роль"
        permissions={permissions}
        saveRole={save}
        onCancel={close}
      />
    </EntityDrawer>
  )
}

export default CreateRoleDrawer
