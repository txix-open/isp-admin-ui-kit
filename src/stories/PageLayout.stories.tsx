import { ReloadOutlined } from '@ant-design/icons'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Alert, Button, List, Table } from 'antd'
import { useState } from 'react'

import PageLayout, {
  PageAccessDenied,
  PageHeader,
  PageLoading
} from '@components/PageLayout'
import { TableDate, TableEmpty, TableStatus } from '@components/TableUI'

import UsersFilters from '@pages/UsersPage/UsersFilters'
import { filterUsers, readUserFilters } from '@pages/UsersPage/userFilters'
import '@pages/UsersPage/users-page.scss'

import type { UserType } from '@type/user.type'

import './story-workspace.scss'

const users: UserType[] = Array.from({ length: 26 }, (_, index) => ({
  id: index + 1,
  createdAt: '',
  updatedAt: '',
  password: '',
  description: '',
  roleId: (index % 2) + 1,
  roleName: index % 2 ? 'Администратор' : 'Оператор',
  firstName: index % 2 ? 'Ирина' : 'Александр',
  lastName: index ? `Оператор ${index}` : 'Сотрудник с длинной фамилией',
  email: `operator${index + 1}@example.test`,
  blocked: index % 3 === 0,
  roles: [(index % 2) + 1],
  lastSessionCreatedAt: '2026-10-29T10:00:00Z'
}))
const roleOptions = [
  { value: 1, label: 'Оператор' },
  { value: 2, label: 'Администратор' }
]
type State =
  | 'ready'
  | 'filtered'
  | 'noMatches'
  | 'loading'
  | 'empty'
  | 'error'
  | 'refreshError'
  | 'denied'

function UsersWorkspace({ state }: { state: State }) {
  return <UsersList key={state} state={state} />
}

function UsersList({ state }: { state: State }) {
  const [params, setParams] = useState(
    () =>
      new URLSearchParams(
        state === 'filtered'
          ? 'search=Ирина&role=2&status=active'
          : state === 'noMatches'
            ? 'search=Несуществующий'
            : ''
      )
  )
  const [retried, setRetried] = useState(false)
  const filters = readUserFilters(params)
  const hasFilters = Boolean(
    filters.search || filters.roleId !== undefined || filters.status !== 'all'
  )
  const reset = () => setParams(new URLSearchParams())
  const loading = state === 'loading'
  const failed = !retried && (state === 'error' || state === 'refreshError')
  const rows =
    state === 'empty' || (failed && state === 'error')
      ? []
      : filterUsers(users, filters)
  const refresh = () => setRetried(true)

  if (state === 'denied') {
    return (
      <PageAccessDenied title="Пользователи" context="Пользователи и роли" />
    )
  }

  return (
    <PageLayout
      title="Пользователи"
      context="Пользователи и роли"
      actions={
        <Button icon={<ReloadOutlined />} onClick={refresh} disabled={loading}>
          Обновить
        </Button>
      }
    >
      {failed && (
        <Alert
          type="error"
          showIcon
          title={
            state === 'error'
              ? 'Не удалось загрузить пользователей'
              : 'Не удалось обновить список. Показаны ранее загруженные данные.'
          }
          action={<Button onClick={refresh}>Повторить</Button>}
        />
      )}
      {loading ? (
        <PageLoading label="Загрузка пользователей…" />
      ) : (
        <>
          <UsersFilters
            filters={filters}
            roleOptions={roleOptions}
            onChange={(name, value) =>
              setParams((current) => {
                const next = new URLSearchParams(current)
                if (value) next.set(name, value)
                else next.delete(name)
                return next
              })
            }
            onReset={reset}
          />
          <Table<UserType>
            className="admin-table"
            rowKey="id"
            dataSource={rows}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            scroll={{ x: 650 }}
            locale={{
              emptyText:
                failed && state === 'error' ? null : (
                  <TableEmpty
                    description={
                      hasFilters
                        ? 'По заданным условиям пользователи не найдены'
                        : 'Пользователей пока нет'
                    }
                  >
                    {hasFilters && (
                      <Button onClick={reset}>Сбросить фильтры</Button>
                    )}
                  </TableEmpty>
                )
            }}
            columns={[
              {
                title: 'ID',
                dataIndex: 'id',
                className: 'admin-table-meta admin-table-number',
                width: 70
              },
              {
                title: 'Пользователь',
                key: 'name',
                className: 'admin-table-name',
                render: (_, user) => `${user.firstName} ${user.lastName}`
              },
              {
                title: 'Статус',
                dataIndex: 'blocked',
                render: (blocked: boolean) => (
                  <TableStatus tone={blocked ? 'error' : 'neutral'}>
                    {blocked ? 'Заблокирован' : 'Не заблокирован'}
                  </TableStatus>
                )
              },
              {
                title: 'Последняя сессия',
                dataIndex: 'lastSessionCreatedAt',
                render: (value: string) => <TableDate value={value} />
              }
            ]}
          />
        </>
      )}
    </PageLayout>
  )
}

const meta = {
  title: 'Интерфейс/Лейаут и списки',
  component: UsersWorkspace,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div className="story-workspace">
        <Story />
      </div>
    )
  ],
  args: { state: 'ready' }
} satisfies Meta<typeof UsersWorkspace>

export default meta
type Story = StoryObj<typeof meta>

export const TableWorkspace: Story = { name: 'Таблица с общей шапкой' }
export const ActiveFilters: Story = {
  name: 'Активные фильтры',
  args: { state: 'filtered' }
}
export const EmptySearch: Story = {
  name: 'Пустой результат поиска и сброс',
  args: { state: 'noMatches' }
}
export const EmptyList: Story = {
  name: 'Пустой список',
  args: { state: 'empty' }
}
export const Loading: Story = {
  name: 'Загрузка в рабочей области',
  args: { state: 'loading' }
}
export const Error: Story = {
  name: 'Ошибка и повтор запроса',
  args: { state: 'error' }
}
export const RefreshError: Story = {
  name: 'Ошибка обновления с сохранёнными строками',
  args: { state: 'refreshError' }
}
export const AccessDenied: Story = {
  name: 'Нет доступа · 403',
  args: { state: 'denied' }
}

function ColumnWorkspace() {
  const [selected, setSelected] = useState(1)
  return (
    <PageLayout split title="Доступы приложений">
      <div className="story-workspace__columns">
        <section className="workspace-card">
          <PageHeader level={2} title="Приложения" />
          <div className="story-workspace__scroll">
            <List
              dataSource={Array.from({ length: 24 }, (_, index) => index + 1)}
              renderItem={(id) => (
                <List.Item>
                  <Button
                    type={selected === id ? 'primary' : 'text'}
                    aria-pressed={selected === id}
                    onClick={() => setSelected(id)}
                  >
                    Приложение {id}
                  </Button>
                </List.Item>
              )}
            />
          </div>
        </section>
        <section className="workspace-card">
          <PageHeader level={2} title={`Приложение ${selected}`} />
          <div className="story-workspace__scroll">
            <List
              dataSource={Array.from(
                { length: 32 },
                (_, index) => `/api/apps/${selected}/resources/${index + 1}`
              )}
              renderItem={(path) => <List.Item>{path}</List.Item>}
            />
          </div>
        </section>
      </div>
    </PageLayout>
  )
}

export const IndependentPanels: Story = {
  name: 'Колонки с независимой прокруткой',
  render: () => <ColumnWorkspace />
}
