import { FC, memo } from 'react'

import JsonSchemaViewer from '@widgets/JSONViewer'
import Modal from '@widgets/Modal'

import { ConfigSchemaModalPropsType } from '@components/ConfigSchemaModal/config-schema-moda.type.ts'

import './config-schema-modal.scss'

const ConfigSchemaModal: FC<ConfigSchemaModalPropsType> = ({
  open,
  onClose,
  schema = {}
}) => {
  return (
    <div className="config-schema-modal">
      <Modal title="Текущая схема" open={open} onClose={onClose}>
        <JsonSchemaViewer schema={schema} />
      </Modal>
    </div>
  )
}

export default memo(ConfigSchemaModal)
