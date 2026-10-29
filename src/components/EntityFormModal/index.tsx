import { Button } from 'antd'
import { FormEventHandler, ReactNode, useId } from 'react'

import Modal from '@widgets/Modal'

import './entity-form-modal.scss'

interface EntityFormModalProps {
  title: ReactNode
  open: boolean
  onClose: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  children: ReactNode
  submitText: string
  busy?: boolean
  submitDisabled?: boolean
}

/** Shared shell for short entity forms; validation and mutations stay with the caller. */
const EntityFormModal = ({
  title,
  open,
  onClose,
  onSubmit,
  children,
  submitText,
  busy = false,
  submitDisabled = false
}: EntityFormModalProps) => {
  const formId = useId()
  const close = () => {
    if (!busy) onClose()
  }
  return (
    <Modal
      title={title}
      open={open}
      onClose={close}
      className="entity-form-modal"
      loading={busy}
      actions={
        <>
          <Button onClick={close} disabled={busy}>
            Отмена
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            form={formId}
            loading={busy}
            disabled={busy || submitDisabled}
          >
            {submitText}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        onSubmit={(event) => {
          if (busy || submitDisabled) event.preventDefault()
          else onSubmit(event)
        }}
        aria-busy={busy}
      >
        <fieldset disabled={busy}>{children}</fieldset>
      </form>
    </Modal>
  )
}

export default EntityFormModal
