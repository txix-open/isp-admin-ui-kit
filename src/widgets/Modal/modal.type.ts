import { ReactNode } from 'react'

export interface ModalPropsType {
  open: boolean
  onOk?: () => void
  onClose?: () => void
  title: string
  children: ReactNode
  footer?: { onOkText: string; onCanselText: string }
  loading?: boolean
}
