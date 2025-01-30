import { ModalProps } from 'antd'

export type AgreementModalPropsType = ModalProps & {
  description: string
  showTextArea?: boolean
  onConfirm: (message: string) => void
}
