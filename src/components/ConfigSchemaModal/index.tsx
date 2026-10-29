import { FC, memo } from 'react'

import JsonSchemaViewer from '@widgets/JSONViewer'
import Modal from '@widgets/Modal'

import { ConfigSchemaModalPropsType } from '@components/ConfigSchemaModal/config-schema-moda.type'

import './config-schema-modal.scss'

const ConfigSchemaModal: FC<ConfigSchemaModalPropsType> = ({
  open,
  onClose,
  schema = {}
}) => {
  return (
    <Modal
      title="Текущая схема"
      open={open}
      onClose={onClose}
      width={1040}
      className="config-schema-modal"
    >
      <div className="config-schema-modal__surface">
        <JsonSchemaViewer schema={schema} />
      </div>
    </Modal>
  )
}

export default memo(ConfigSchemaModal)
