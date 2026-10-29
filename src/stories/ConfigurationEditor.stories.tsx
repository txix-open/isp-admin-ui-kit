import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Space } from 'antd'
import { useState } from 'react'

import ConfigurationEditorForm from '@components/ConfigurationEditorForm'
import PageLayout from '@components/PageLayout'

import type {
  ConfigType,
  ResponseSchemaType
} from '@pages/ModulesPage/module.type'

import './story-workspace.scss'

const configuration: ConfigType = {
  id: 'fixture',
  moduleId: 'connections',
  name: 'Подключения сервиса',
  description: '',
  active: true,
  valid: true,
  version: 1,
  commonConfigs: [],
  createdAt: '',
  updatedAt: '',
  data: {
    connections: [
      {
        host: 'db.example.test',
        options: { sslmode: 'require' },
        tags: ['primary']
      },
      { host: 'replica.example.test', options: {}, tags: [] }
    ]
  }
}

const jsonSchema: ResponseSchemaType = {
  id: 'schema',
  moduleId: configuration.moduleId,
  createdAt: '',
  updatedAt: '',
  version: '1',
  schema: {
    type: 'object',
    properties: {
      connections: {
        type: 'array',
        title: 'Подключения',
        description: 'У каждого подключения свои параметры и метки.',
        maxItems: 3,
        items: {
          type: 'object',
          required: ['host'],
          properties: {
            host: { title: 'Хост', type: 'string', minLength: 3 },
            options: {
              title: 'Дополнительные параметры подключения',
              type: 'object',
              additionalProperties: { type: 'string' },
              maxProperties: 3
            },
            tags: {
              title:
                'Метки для выбора подключения при переключении на резервный сервер',
              type: 'array',
              items: { type: 'string' },
              maxItems: 2
            }
          }
        }
      }
    }
  }
}

type Mode = 'nested' | 'keys' | 'empty' | 'invalid' | 'disabled'

function EditorExample({ mode }: { mode: Mode }) {
  return <EditorWorkspace key={mode} mode={mode} />
}

function EditorWorkspace({ mode }: { mode: Mode }) {
  const original =
    mode === 'empty'
      ? { ...configuration, data: { connections: [] } }
      : mode === 'invalid'
        ? {
            ...configuration,
            data: {
              connections: [{ host: 'x', options: { sslmode: 'require' } }]
            }
          }
        : configuration
  const [config, setConfig] = useState<ConfigType | undefined>(original)
  const [showDraft, setShowDraft] = useState(mode === 'keys')
  const [revision, setRevision] = useState(0)

  return (
    <PageLayout
      title={configuration.name}
      context="Редактор конфигурации"
      actions={
        <Space wrap>
          <Button onClick={() => setShowDraft((value) => !value)}>
            {showDraft ? 'Скрыть JSON' : 'Показать JSON'}
          </Button>
          <Button
            onClick={() => {
              setConfig(original)
              setRevision((value) => value + 1)
            }}
          >
            Сбросить пример
          </Button>
        </Space>
      }
    >
      <ConfigurationEditorForm
        key={revision}
        bufConfig={config ?? original}
        jsonSchema={jsonSchema}
        setBufConfig={setConfig}
        isCurrentConfigLoading={false}
        disabled={mode === 'disabled'}
      />
      {showDraft && (
        <details open>
          <summary>JSON черновика</summary>
          <pre style={{ overflow: 'auto' }}>
            {JSON.stringify(config?.data, null, 2)}
          </pre>
        </details>
      )}
    </PageLayout>
  )
}

const meta = {
  title: 'Интерфейс/Редактор конфигурации',
  component: EditorExample,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="story-workspace">
        <Story />
      </div>
    )
  ],
  args: { mode: 'nested' }
} satisfies Meta<typeof EditorExample>

export default meta
type Story = StoryObj<typeof meta>

export const NestedSections: Story = { name: 'Вложенные секции и массивы' }
export const DynamicKeys: Story = {
  name: 'Редактируемые ключ и значение',
  args: { mode: 'keys' }
}
export const EmptyArray: Story = {
  name: 'Пустой массив',
  args: { mode: 'empty' }
}
export const Validation: Story = {
  name: 'Ошибка валидации поля',
  args: { mode: 'invalid' }
}
export const Disabled: Story = {
  name: 'Поля заблокированы',
  args: { mode: 'disabled' }
}
