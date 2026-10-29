import { ReactNode } from 'react'

export interface ModalPropsType {
  open: boolean
  onOk?: () => void
  onClose?: () => void
  title: ReactNode
  children: ReactNode
  footer?: { onOkText: string; onCanselText: string }
  loading?: boolean
  width?: number | string
  className?: string
  actions?: ReactNode
  confirmDisabled?: boolean
}
