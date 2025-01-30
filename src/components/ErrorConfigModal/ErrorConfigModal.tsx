import { Table } from 'antd'
import { FC } from 'react'

import Modal from '@widgets/Modal'
import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

interface ErrorConfigModalProps
  extends Omit<ModalPropsType, 'title' | 'children'> {
  details?: { [key: string]: string }
}

const ErrorConfigModal: FC<ErrorConfigModalProps> = ({
  details = {},
  onClose,
  open
}) => {
  const columns = [
    {
      dataIndex: 'key',
      key: 'key',
      render: (text: string) => <span style={{ color: 'red' }}>{text}</span>
    },
    {
      dataIndex: 'value',
      key: 'value'
    }
  ]

  const data = Object.keys(details).map((key) => ({
    key,
    value: details[key]
  }))

  return (
    <Modal
      title="Несоотвествия схемы конфигурации"
      open={open}
      onClose={onClose}
    >
      <div>
        <Table
          columns={columns}
          dataSource={data}
          showHeader={false}
          pagination={false}
        />
      </div>
    </Modal>
  )
}

export default ErrorConfigModal
