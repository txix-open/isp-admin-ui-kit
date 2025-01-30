import { Button } from 'antd'
import { useEffect } from 'react'
import CloseBtn from 'src/ui/CloseBtn'

import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

import './modal.scss'

const Modal = ({
  open,
  onOk = () => {},
  footer,
  title,
  children,
  onClose = () => {},
  loading = false
}: ModalPropsType) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose()
    }
  }

  const closeModal = () => {
    onClose()
    document.body.classList.remove('modal-open')
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)

    if (open) {
      document.body.classList.add('modal-open')
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <section className="modal" onClick={closeModal}>
      <div className="modal__wrap" onClick={(event) => event.stopPropagation()}>
        <h1 className="modal__title">{title}</h1>
        <div className="modal__content">{children}</div>
        {footer && (
          <div className="modal__footer">
            <Button type="default" onClick={closeModal}>
              {footer.onCanselText}
            </Button>
            <Button type="primary" onClick={onOk} loading={loading}>
              {footer.onOkText}
            </Button>
          </div>
        )}
        <CloseBtn onClick={closeModal} ariaLabel="close" />
      </div>
    </section>
  )
}

export default Modal
