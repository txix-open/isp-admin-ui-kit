import { ReactJsonView } from 'isp-ui-kit'
import { FC, memo, useContext } from 'react'

import Modal from '@widgets/Modal'

import { ConfigurationPreviewModalPropsType } from '@components/ConfigurationPreviewModal/configuration-preview-modal.type'

import { Context } from '@stores/index'

import './configuration-preview-modal.scss'

const ConfigurationPreviewModal: FC<ConfigurationPreviewModalPropsType> = ({
  versionCompare = false,
  config,
  open,
  onClose
}) => {
  const { changeTheme } = useContext(Context)
  const data = JSON.parse(JSON.stringify(config.data || {}))
  const configName = versionCompare
    ? `Версия: ${config.configVersion}`
    : config.name
  return (
    <Modal
      title={configName || 'Конфигурация'}
      open={open}
      onClose={onClose}
      width={1040}
      className="configuration-preview-modal"
    >
      <div className="configuration-preview-modal__surface">
        <ReactJsonView
          theme={changeTheme ? 'twilight' : ''}
          src={data}
          name={null}
          style={{ backgroundColor: 'transparent', margin: 0 }}
          displayObjectSize={false}
          enableClipboard
          sortKeys={true}
          displayDataTypes={false}
          editKeys={false}
        />
      </div>
    </Modal>
  )
}

export default memo(ConfigurationPreviewModal)
