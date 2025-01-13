import { Input, Modal } from 'antd'
import { ChangeEvent, useState } from 'react'

import { AgreementModalPropsType } from '@widgets/AgreementModal/agreement-modal.type.ts'

import './agreement-modal.scss'

const { TextArea } = Input

const AgreementModal = ({
  description,
  onConfirm,
  showTextArea = true,
  ...rest
}: AgreementModalPropsType) => {
  const [message, setMessage] = useState('')

  const handleOnChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleOnOk = () => {
    onConfirm(message)
  }

  return (
    <Modal
      okText="Отправить"
      className="agreement-modal"
      onOk={handleOnOk}
      {...rest}
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
        />
      )}
    </Modal>
  )
}

export default AgreementModal
