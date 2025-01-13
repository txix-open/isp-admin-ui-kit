import { ReactJsonView } from 'isp-ui-kit'
import { FC, memo, useContext } from 'react'

import Modal from '@widgets/Modal'

import { ConfigurationPreviewModalPropsType } from '@components/ConfigurationPreviewModal/configuration-preview-modal.type.ts'

import { Context } from '@stores/index.tsx'

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
    <div className="configuration-preview-modal">
      <Modal title={configName || ''} open={open} onClose={onClose}>
        <ReactJsonView
          theme={changeTheme ? 'twilight' : ''}
          src={data}
          name={false}
          sortKeys={true}
          displayDataTypes={false}
          editKeys={false}
        />
      </Modal>
    </div>
  )
}

export default memo(ConfigurationPreviewModal)
