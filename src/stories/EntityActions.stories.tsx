import { DeleteOutlined } from '@ant-design/icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, Button, Form, Input, Popconfirm, Space } from 'antd'
import { useState } from 'react'

import EntityDrawer from '@components/EntityDrawer'
import PageLayout, { PageHeader } from '@components/PageLayout'
import { TableActionButton, TableEmpty } from '@components/TableUI'
import UnsavedChangesProvider from '@components/UnsavedChangesProvider'

import {
  deleteConfirmation,
  irreversibleDelete
} from '@utils/deleteConfirmation'

import useUnsavedChanges from '@hooks/useUnsavedChanges'

import './story-workspace.scss'

const entityName = 'Оператор тестового окружения'

function DeleteExample({ fail }: { fail: boolean }) {
  const [deleted, setDeleted] = useState(false)
  const [error, setError] = useState(false)

  return (
    <PageLayout title="Роли пользователей">
      {error && (
        <Alert
          showIcon
          type="error"
          title={`Не удалось удалить роль «${entityName}»`}
        />
      )}
      {deleted ? (
        <TableEmpty description="Ролей пока нет">
          <Button onClick={() => setDeleted(false)}>Сбросить пример</Button>
        </TableEmpty>
      ) : (
        <Space wrap>
          <strong>{entityName}</strong>
          <Popconfirm
            placement="bottom"
            title={`Удалить роль «${entityName}»?`}
            description={irreversibleDelete}
            {...deleteConfirmation}
            onConfirm={() => (fail ? setError(true) : setDeleted(true))}
          >
            <TableActionButton
              danger
              icon={<DeleteOutlined />}
              aria-label={`Удалить роль «${entityName}»`}
            />
          </Popconfirm>
        </Space>
      )}
    </PageLayout>
  )
}

function DraftDrawer({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const guard = useUnsavedChanges({
    dirty: name !== '',
    label: 'Новая роль',
    overlay: true
  })
  const close = () => guard.requestLeave(onClose)
  return (
    <EntityDrawer title="Новая роль" open onClose={close}>
      <PageHeader level={2} title="Новая роль" focusOnMount />
      <Form
        layout="vertical"
        style={{ padding: 16 }}
        onFinish={() => {
          guard.markSaved()
          onClose()
        }}
      >
        <Form.Item label="Название" htmlFor="story-role-name">
          <Input
            id="story-role-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </Form.Item>
        <Space wrap>
          <Button onClick={close}>Отмена</Button>
          <Button type="primary" htmlType="submit" disabled={!name.trim()}>
            Создать роль
          </Button>
        </Space>
      </Form>
    </EntityDrawer>
  )
}

function DraftExample() {
  const [open, setOpen] = useState(false)
  return (
    <UnsavedChangesProvider>
      <PageLayout
        title="Роли пользователей"
        actions={
          <Button type="primary" onClick={() => setOpen(true)}>
            Новая роль
          </Button>
        }
      >
        <p>
          Введите название в боковой панели, затем нажмите «Отмена» или Escape.
        </p>
        {open && <DraftDrawer onClose={() => setOpen(false)} />}
      </PageLayout>
    </UnsavedChangesProvider>
  )
}

const meta = {
  title: 'Интерфейс/Действия и черновики',
  component: DeleteExample,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="story-workspace">
        <Story />
      </div>
    )
  ],
  args: { fail: false }
} satisfies Meta<typeof DeleteExample>

export default meta
type Story = StoryObj<typeof meta>

export const DeleteConfirmation: Story = { name: 'Подтверждение удаления' }
export const DeleteError: Story = {
  name: 'Ошибка удаления',
  args: { fail: true }
}
export const UnsavedDraft: Story = {
  name: 'Защита черновика в боковой панели',
  render: () => <DraftExample />
}
