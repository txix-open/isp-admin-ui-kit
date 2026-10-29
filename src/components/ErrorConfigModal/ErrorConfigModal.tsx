import { Table } from 'antd'
import { FC } from 'react'

import Modal from '@widgets/Modal'
import { ModalPropsType } from '@widgets/Modal/modal.type'

interface ErrorConfigModalProps extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
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
      title: 'Поле',
      width: '40%',
      key: 'key',
      render: (text: string) => (
        <span
          style={{
            color: 'var(--ant-color-error-text)',
            overflowWrap: 'anywhere'
          }}
        >
          {text}
        </span>
      )
    },
    {
      dataIndex: 'value',
      title: 'Ошибка',
      width: '60%',
      render: (text: string) => (
        <span style={{ overflowWrap: 'anywhere' }}>{text}</span>
      ),
      key: 'value'
    }
  ]

  const data = Object.keys(details).map((key) => ({
    key,
    value: details[key]
  }))

  return (
    <Modal
      title="Ошибки схемы конфигурации"
      width={960}
      open={open}
      onClose={onClose}
    >
      <div>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="key"
          tableLayout="fixed"
          pagination={false}
        />
      </div>
    </Modal>
  )
}

export default ErrorConfigModal
