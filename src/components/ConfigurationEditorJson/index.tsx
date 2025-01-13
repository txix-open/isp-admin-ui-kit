import { Spin } from 'antd'
import { ReactJsonView } from 'isp-ui-kit'
import { FC, useContext } from 'react'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type.ts'

import { Context } from '@stores/index.tsx'

const ConfigurationEditorJson: FC<ConfigurationEditorPropsType> = ({
  bufConfig,
  setBufConfig,
  isCurrentConfigLoading
}) => {
  const { changeTheme } = useContext(Context)
  if (isCurrentConfigLoading) {
    return <Spin className="spin" />
  }

  const handleEdit = (updated_src: any) => {
    const newData = {
      ...bufConfig,
      data: { ...updated_src }
    }
      setBufConfig(newData)
  }

  return (
    <ReactJsonView
      theme={changeTheme ? 'twilight' : ''}
      onAdd={({ updated_src }: any) => handleEdit(updated_src)}
      onDelete={({ updated_src }: any) => handleEdit(updated_src)}
      displayDataTypes={false}
      displayObjectSize={false}
      name={null}
      enableClipboard={true}
      iconStyle="square"
      onEdit={({ updated_src }: any) => handleEdit(updated_src)}
      src={bufConfig?.data}
      sortKeys={true}
      collapsed={1}
    />
  )
}

export default ConfigurationEditorJson
