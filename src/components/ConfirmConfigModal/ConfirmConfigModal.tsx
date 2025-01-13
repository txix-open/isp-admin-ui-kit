import { Button } from 'antd'
import { Dispatch, FC, SetStateAction } from 'react'
import { useParams } from 'react-router-dom'

import Modal from '@widgets/Modal'
import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import configServiceApi from '@services/configService.ts'

import './confirm-config-modal.scss'

interface ConfirmModalProps extends Omit<ModalPropsType, 'title' | 'children'> {
  handleSaveClick: (upVersion?: number, unsafe?: boolean) => void
  setBufConfig: Dispatch<SetStateAction<ConfigType | undefined>>
  currentConfig: ConfigType | undefined
}

const ConfirmConfigModal: FC<ConfirmModalProps> = ({
  currentConfig,
  setBufConfig,
  handleSaveClick,
  onClose = () => null,
  open
}) => {
  const { id = '' } = useParams()
  const isNew = id === 'new' ? '' : id

  const { data } = configServiceApi.useGetConfigByIdQuery(isNew)

  const onConfirmHandler = () => {
    setBufConfig(currentConfig)
    onClose()
  }

  return (
    <div className="confirm-config-modal">
    <Modal
      title="Версия конфигурации была кем-то изменена"
      open={open}
      onClose={onClose}
    >
      <Button
        className="confirm-btn danger"
        type="primary"
        danger
        onClick={() => {
          handleSaveClick(data && data.version)
          onClose()
        }}
      >
        Сохранить принудительно
      </Button>
      <Button className="confirm-btn" type="primary" onClick={onConfirmHandler}>
        Принять изменения
      </Button>
    </Modal>
    </div>
  )
}
export default ConfirmConfigModal
