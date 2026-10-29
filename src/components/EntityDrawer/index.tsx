import { Drawer } from 'antd'
import { ReactNode } from 'react'

import './entity-drawer.scss'

const EntityDrawer = ({
  title,
  open,
  busy = false,
  onClose,
  children
}: {
  title: string
  open: boolean
  busy?: boolean
  onClose: () => void
  children: ReactNode
}) => (
  <Drawer
    aria-label={title}
    open={open}
    onClose={() => {
      if (!busy) onClose()
    }}
    size="min(960px, 100vw)"
    mask={{ closable: false }}
    keyboard={!busy}
    closable={false}
    autoFocus={false}
    destroyOnHidden
    classNames={{ body: 'entity-drawer__body' }}
  >
    {open && children}
  </Drawer>
)

export default EntityDrawer
