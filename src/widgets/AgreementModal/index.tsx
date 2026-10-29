import { Input, Modal } from 'antd'
import { ChangeEvent, useEffect, useState } from 'react'

import { AgreementModalPropsType } from '@widgets/AgreementModal/agreement-modal.type'

import '../Modal/modal.scss'
import './agreement-modal.scss'

const { TextArea } = Input

const AgreementModal = ({
  description,
  onConfirm,
  showTextArea = true,
  ...rest
}: AgreementModalPropsType) => {
  const [message, setMessage] = useState('')
  useEffect(() => {
    if (rest.open) setMessage('')
  }, [rest.open])

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleOnOk = () => {
    onConfirm(message)
  }

  return (
    <Modal
      okText="Отправить"
      onOk={handleOnOk}
      width={640}
      {...rest}
      className={`admin-modal agreement-modal ${rest.className ?? ''}`}
      classNames={{
        container: 'modal__container',
        title: 'modal__title',
        body: 'modal__content',
        footer: 'modal__footer'
      }}
      mask={{ closable: false }}
      closable={
        rest.confirmLoading || rest.closable === false
          ? false
          : { 'aria-label': 'Закрыть' }
      }
    >
      <span
        data-cy="agreement-modal__description"
        className="agreement-modal__description"
      >
        {description}
      </span>
      {showTextArea && (
        <TextArea
          data-cy="agreement-modal__text-area"
          className="agreement-modal__text-area"
          value={message}
          onChange={handleOnChange}
          aria-label={description}
          disabled={rest.confirmLoading}
          autoSize={{ minRows: 3, maxRows: 7 }}
        />
      )}
    </Modal>
  )
}

export default AgreementModal
