import { Alert, Button, Spin } from 'antd'
import { FC } from 'react'
import { useParams } from 'react-router-dom'

import Modal from '@widgets/Modal'
import { ModalPropsType } from '@widgets/Modal/modal.type'

import { ConfigType } from '@pages/ModulesPage/module.type'

import configServiceApi from '@services/configService'

import './confirm-config-modal.scss'

interface ConfirmModalProps extends Omit<ModalPropsType, 'title' | 'children'> {
  onForce: (version: number) => void
  onAccept: (config: ConfigType) => void
}

const ConfirmConfigModal: FC<ConfirmModalProps> = ({
  onAccept,
  onForce,
  onClose,
  open,
  loading
}) => {
  const { id = '' } = useParams()
  const {
    currentData: data,
    isFetching,
    isError,
    refetch
  } = configServiceApi.useGetConfigByIdQuery(id, {
    skip: !open || !id || id === 'new',
    refetchOnMountOrArgChange: true
  })
  const disabled = loading || isFetching || isError || !data
  return (
    <Modal
      title="Конфигурация изменена на сервере"
      open={open}
      onClose={onClose}
      loading={loading}
      width={800}
      className="confirm-config-modal"
      actions={
        <>
          <Button onClick={onClose} disabled={loading}>
            Продолжить редактирование
          </Button>
          <Button disabled={disabled} onClick={() => data && onAccept(data)}>
            Принять серверную версию
          </Button>
          <Button
            type="primary"
            danger
            disabled={disabled}
            loading={loading}
            onClick={() => data && onForce(data.version)}
          >
            Сохранить принудительно
          </Button>
        </>
      }
    >
      <p>Ваш черновик остаётся в редакторе.</p>
      <p>
        Принятие серверной версии заменит черновик. Принудительное сохранение
        заменит серверную конфигурацию вашим черновиком.
      </p>
      {isFetching && <Spin />}
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить актуальную версию"
          action={<Button onClick={() => refetch()}>Повторить</Button>}
        />
      )}
    </Modal>
  )
}
export default ConfirmConfigModal
