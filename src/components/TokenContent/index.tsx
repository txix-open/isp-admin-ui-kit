import {
  CopyOutlined,
  DeleteOutlined,
  ReloadOutlined,
  PlusOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  message,
  Popconfirm,
  Result,
  Table,
  Tooltip
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import ClipboardJS from 'clipboard'
import dayjs from 'dayjs'
import { FormSelect } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { ValidationRules } from '@constants/form/validationRules'

import SearchAppByToken from '@ui/SearchAppByToken'

import EntityFormModal from '@components/EntityFormModal'
import {
  TableActionButton,
  TableActions,
  TableDate,
  TableStatus
} from '@components/TableUI'

import { ApplicationTokenType } from '@pages/ApplicationsPage/applications.type'

import { notifyApiError } from '@utils/apiErrorNotifications'

import useRole from '@hooks/useRole'

import tokensApi from '@services/tokensService'

import { PermissionKeysType } from '@type/roles.type'

import './tokens.scss'

const lifetimeOptions = [
  { value: 3600000, label: 'Один час' },
  { value: 86400000, label: 'Один день' },
  { value: 2592000000, label: '30 дней' },
  { value: 31536000000, label: 'Один год' },
  { value: -1, label: 'Бессрочно' }
]

const TokenContent = ({ id }: { id: number }) => {
  const { hasPermission } = useRole()
  const canView = hasPermission(PermissionKeysType.application_group_token_view)
  const canAdd = hasPermission(PermissionKeysType.application_group_token_add)
  const canRemove = hasPermission(
    PermissionKeysType.application_group_token_delete
  )
  const query = tokensApi.useGetTokensByAppIdQuery({ id }, { skip: !canView })
  const [createToken, createState] = tokensApi.useCreateTokenMutation()
  const [revokeToken, revokeState] = tokensApi.useRevokeTokensMutation()
  const [open, setOpen] = useState(false)
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting }
  } = useForm<{ expireTime: number }>({
    defaultValues: { expireTime: 86400000 }
  })
  const busy = isSubmitting || createState.isLoading || revokeState.isLoading

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn')
    clipboard.on('success', () => {
      message.success('Токен скопирован')
    })
    clipboard.on('error', () => {
      message.error('Не удалось скопировать токен')
    })
    return () => clipboard.destroy()
  }, [])

  const close = () => {
    if (!busy) {
      setOpen(false)
      reset()
    }
  }
  const issueToken = handleSubmit((values) => {
    if (!canAdd || busy) return
    return createToken({ appId: id, expireTimeMs: values.expireTime })
      .unwrap()
      .then(() => {
        setOpen(false)
        reset()
        message.success('Токен выпущен')
      })
      .catch((error) => notifyApiError(error, 'Не удалось выпустить токен'))
  })
  const revoke = (token: string) => {
    if (!canRemove || busy) return
    return revokeToken({ appId: id, tokens: [token] })
      .unwrap()
      .then(() => {
        message.success('Токен отозван')
      })
      .catch((error) => notifyApiError(error, 'Не удалось отозвать токен'))
  }
  const maskToken = (value: string) =>
    value.length > 6 ? `${value.slice(0, 3)}…${value.slice(-3)}` : value

  const columns: ColumnsType<ApplicationTokenType> = [
    {
      title: 'Токен',
      dataIndex: 'token',
      className: 'admin-table-name',
      width: 130,
      render: maskToken
    },
    {
      title: 'Выпущен',
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string) => <TableDate value={value} />
    },
    {
      title: 'Срок действия',
      dataIndex: 'expireTime',
      width: 190,
      render: (value: number, record) => {
        if (value === -1) return 'Бессрочно'
        const expiry = dayjs(record.createdAt).add(value, 'millisecond')
        if (!expiry.isValid()) return '—'
        return expiry.isBefore(dayjs()) ? (
          <TableStatus tone="warning">Истёк</TableStatus>
        ) : (
          <TableDate value={expiry.toISOString()} />
        )
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 112,
      align: 'right',
      render: (_, record) => (
        <TableActions>
          <Tooltip title="Скопировать токен">
            <TableActionButton
              className="copy-btn"
              aria-label="Скопировать токен"
              icon={<CopyOutlined />}
              data-clipboard-text={record.token}
            />
          </Tooltip>
          {canRemove && (
            <Popconfirm
              title={`Отозвать токен «${maskToken(record.token)}»?`}
              description="Приложение больше не сможет использовать этот токен."
              okText="Отозвать"
              okButtonProps={{ danger: true }}
              cancelText="Отмена"
              onConfirm={() => revoke(record.token)}
            >
              <TableActionButton
                danger
                aria-label="Отозвать токен"
                icon={<DeleteOutlined />}
                disabled={busy}
                loading={
                  revokeState.isLoading &&
                  revokeState.originalArgs?.tokens.includes(record.token)
                }
              />
            </Popconfirm>
          )}
        </TableActions>
      )
    }
  ]

  if (!canView) return <Result status="403" title="Нет доступа к токенам" />
  return (
    <section className="token-content">
      <header className="token-content__header">
        <h3>Токены приложения</h3>
        <SearchAppByToken />
        <Button
          icon={<ReloadOutlined />}
          loading={query.isFetching}
          onClick={() => query.refetch()}
        >
          Обновить токены
        </Button>
        {canAdd && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            disabled={busy}
            onClick={() => setOpen(true)}
          >
            Выпустить токен
          </Button>
        )}
      </header>
      {query.isError && (
        <Alert
          type="error"
          showIcon
          title={
            query.data
              ? 'Не удалось обновить токены. Показаны ранее загруженные данные.'
              : 'Не удалось загрузить токены'
          }
          action={
            <Button
              icon={<ReloadOutlined />}
              loading={query.isFetching}
              onClick={() => query.refetch()}
            >
              Повторить
            </Button>
          }
        />
      )}
      <Table<ApplicationTokenType>
        className="admin-table"
        size="middle"
        rowKey="token"
        tableLayout="fixed"
        loading={query.isFetching}
        columns={columns}
        dataSource={query.data ?? []}
        pagination={false}
        scroll={{ x: 610 }}
        locale={{
          emptyText:
            query.isError && !query.data ? (
              'Токены недоступны. Повторите загрузку.'
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Токенов пока нет"
              />
            )
        }}
      />
      <EntityFormModal
        title="Выпуск токена"
        open={open}
        onClose={close}
        onSubmit={issueToken}
        busy={busy}
        submitText="Выпустить токен"
      >
        <p>Выберите срок действия нового токена приложения.</p>
        <FormSelect
          control={control}
          name="expireTime"
          label="Срок действия"
          options={lifetimeOptions}
          rules={{ required: ValidationRules.required }}
          disabled={busy}
        />
      </EntityFormModal>
    </section>
  )
}

export default TokenContent
