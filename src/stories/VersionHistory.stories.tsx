import { loader } from '@monaco-editor/react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Table } from 'antd'
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import { useState } from 'react'
import type { Key } from 'react'

import CompareVersionModal from '@components/CompareVersionModal'
import PageLayout from '@components/PageLayout'
import { TableDate, TableStatus } from '@components/TableUI'

import { Context } from '@stores/index'

import type { VersionType } from '@type/version.type'

import './story-workspace.scss'

const versions: VersionType[] = [3, 2, 1].map((version) => ({
  id: String(version),
  configId: 'example',
  configVersion: version,
  createdAt: `2026-10-${20 + version}T09:00:00Z`,
  data: {
    timeout: version * 30,
    options: { retries: version, sslmode: 'require' }
  }
}))

function VersionHistory({ dark }: { dark: boolean }) {
  const [selected, setSelected] = useState<Key[]>([])
  const [comparison, setComparison] = useState<[VersionType, VersionType]>()
  const [opening, setOpening] = useState(false)
  const [failed, setFailed] = useState(false)

  const compare = async () => {
    const pair = versions.filter((version) => selected.includes(version.id))
    if (pair.length !== 2) return
    setOpening(true)
    setFailed(false)
    try {
      const monaco = await import('monaco-editor')
      self.MonacoEnvironment = {
        getWorker: (_, label) =>
          label === 'json' ? new JsonWorker() : new EditorWorker()
      }
      loader.config({ monaco })
      setComparison([pair[0], pair[1]])
    } catch {
      setFailed(true)
    } finally {
      setOpening(false)
    }
  }

  return (
    <Context.Provider
      value={{
        changeTheme: dark,
        setChangeTheme: () => {},
        excludePermissions: []
      }}
    >
      <PageLayout title="История версий" context="Конфигурация · Подключения">
        <div className="admin-table-toolbar">
          <p className="page-layout__summary" role="status">
            Выбрано версий: {selected.length} из 2
          </p>
          <Button
            type="primary"
            disabled={selected.length !== 2}
            loading={opening}
            onClick={compare}
          >
            Сравнить выбранные
          </Button>
        </div>
        {failed && (
          <p role="alert">
            Не удалось загрузить редактор сравнения. Повторите попытку.
          </p>
        )}
        <Table<VersionType>
          className="admin-table"
          rowKey="id"
          dataSource={versions}
          pagination={false}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: setSelected,
            hideSelectAll: true,
            getCheckboxProps: (version) => ({
              disabled: selected.length >= 2 && !selected.includes(version.id),
              'aria-label': `Выбрать версию ${version.configVersion} для сравнения`
            })
          }}
          columns={[
            {
              title: 'Версия',
              key: 'version',
              render: (_, version) => (
                <>
                  <span className="admin-table-name admin-table-number">
                    {version.configVersion}
                  </span>{' '}
                  {version.configVersion === 3 && (
                    <TableStatus tone="info">Текущая версия</TableStatus>
                  )}
                </>
              )
            },
            {
              title: 'Создано',
              dataIndex: 'createdAt',
              render: (value: string) => <TableDate value={value} />
            }
          ]}
        />
        {comparison && (
          <CompareVersionModal
            open
            configName="Подключения"
            versions={comparison}
            onClose={() => setComparison(undefined)}
          />
        )}
      </PageLayout>
    </Context.Provider>
  )
}

const meta = {
  title: 'Интерфейс/История конфигурации',
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="story-workspace">
        <Story />
      </div>
    )
  ]
} satisfies Meta

export default meta

export const CompareVersions: StoryObj<typeof meta> = {
  name: 'Выбор и сравнение двух версий',
  render: (_, { globals }) => (
    <VersionHistory dark={globals.adminTheme === 'dark'} />
  )
}
