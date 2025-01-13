import Editor from '@monaco-editor/react'
import { FC, useContext } from 'react'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type.ts'
import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import { Context } from '@stores/index.tsx'

const ConfigurationEditorCode: FC<ConfigurationEditorPropsType> = ({
  setDisableBtn = () => {},
  bufConfig,
  setBufConfig
}) => {
  const { changeTheme } = useContext(Context)

  const handleChange = (data: string | undefined) => {
    if (data) {
      try {
        const newData = {
          ...bufConfig,
          data: { ...JSON.parse(data) }
        } as ConfigType
        setDisableBtn(false)
        setBufConfig(newData)
      } catch (error) {
        setDisableBtn(true)
      }
    }
  }

  const editorValue = JSON.stringify(bufConfig?.data, null, '\t')

  return (
    <div>
      <Editor
        width="auto"
        height="100vh"
        language="json"
        theme={changeTheme ? 'vs-dark' : 'vs-white'}
        value={editorValue}
        onChange={handleChange}
        options={{
          minimap: {
            enabled: false
          },
          fontSize: 16
        }}
      />
    </div>
  )
}

export default ConfigurationEditorCode
