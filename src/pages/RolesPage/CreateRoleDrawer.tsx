import { Drawer } from 'antd'
import { useState } from 'react'

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
  const save: RolesContentPropsType['saveRole'] = (values, setError) => {
    setIsSaving(true)
    return saveRole(values, setError).finally(() => setIsSaving(false))
  }

  return (
    <Drawer
      title="Создание роли"
      open={open}
      onClose={close}
      size="min(960px, 100vw)"
      mask={{ closable: false }}
      keyboard={!isSaving}
      closable={!isSaving}
      autoFocus={false}
      destroyOnHidden
      classNames={{ body: 'role-create-drawer__body' }}
    >
      <RolesContent
        title="Новая роль"
        permissions={permissions}
        saveRole={save}
        onCancel={close}
      />
    </Drawer>
  )
}

export default CreateRoleDrawer
