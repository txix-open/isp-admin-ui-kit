import { Button, Modal as AntModal } from 'antd'

import { ModalPropsType } from '@widgets/Modal/modal.type'

import './modal.scss'

const Modal = ({
  open,
  onOk,
  footer,
  title,
  children,
  onClose = () => {},
  loading = false,
  width = 640,
  className = '',
  actions,
  confirmDisabled = false
}: ModalPropsType) => {
  const close = () => {
    if (!loading) onClose()
  }
  return (
    <AntModal
      title={title}
      open={open}
      onCancel={close}
      width={width}
      rootClassName={`admin-modal-root ${className}`}
      className="admin-modal modal__wrap"
      classNames={{
        container: 'modal__container',
        body: 'modal__content',
        title: 'modal__title',
        footer: 'modal__footer'
      }}
      destroyOnHidden
      mask={{ closable: false }}
      keyboard={!loading}
      closable={loading ? false : { 'aria-label': 'Закрыть' }}
      footer={
        actions ??
        (footer ? (
          <>
            <Button onClick={close} disabled={loading}>
              {footer.onCanselText}
            </Button>
            <Button
              type="primary"
              onClick={() => {
                if (!loading && !confirmDisabled) onOk?.()
              }}
              loading={loading}
              disabled={loading || confirmDisabled}
            >
              {footer.onOkText}
            </Button>
          </>
        ) : (
          <Button onClick={close} disabled={loading}>
            Закрыть
          </Button>
        ))
      }
    >
      {children}
    </AntModal>
  )
}

export default Modal
