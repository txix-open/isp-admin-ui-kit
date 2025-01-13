export type ChangePasswordModalType = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

export type ChangePasswordModalProps = {
  open: boolean
  onClose: () => void
}
