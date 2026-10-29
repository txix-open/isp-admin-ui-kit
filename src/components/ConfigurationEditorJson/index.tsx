import { ReactJsonView } from 'isp-ui-kit'
import { FC, useContext } from 'react'

import { PageLoading } from '@components/PageLayout'

import { ConfigurationEditorPropsType } from '@pages/ConfigurationEditorPage/ConfigurationEditor.type'

import { Context } from '@stores/index'

import './configuration-editor-json.scss'

const ConfigurationEditorJson: FC<ConfigurationEditorPropsType> = ({
  bufConfig,
  setBufConfig,
  isCurrentConfigLoading,
  disabled = false
}) => {
  const { changeTheme } = useContext(Context)
  if (isCurrentConfigLoading) {
    return <PageLoading label="Загрузка конфигурации…" />
  }

  const handleEdit = ({ updated_src }: { updated_src: object }) => {
    if (disabled) return false
    setBufConfig((previous) =>
      previous
        ? {
            ...previous,
            data: updated_src as Record<string, unknown>
          }
        : previous
    )
  }

  return (
    <section
      className="configuration-editor-json"
      aria-label="Дерево конфигурации"
    >
      <header className="configuration-editor-json__header">
        <h2>Дерево конфигурации</h2>
        <p>Изменения остаются в черновике до сохранения.</p>
      </header>
      <div className="configuration-editor-json__body">
        <ReactJsonView
          theme={changeTheme ? 'twilight' : ''}
          style={{ backgroundColor: 'transparent', margin: 0 }}
          onAdd={disabled ? false : handleEdit}
          onDelete={disabled ? false : handleEdit}
          displayDataTypes={false}
          displayObjectSize={false}
          name={null}
          enableClipboard={true}
          iconStyle="square"
          onEdit={disabled ? false : handleEdit}
          src={bufConfig?.data}
          sortKeys={true}
          collapsed={1}
        />
      </div>
    </section>
  )
}

export default ConfigurationEditorJson
