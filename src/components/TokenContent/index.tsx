import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Empty,
  message,
  Modal,
  Popconfirm,
  Result,
  Space,
  Table,
  Tooltip
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import ClipboardJS from 'clipboard'
import dayjs from 'dayjs'
import { FormSelect } from 'isp-ui-kit'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

import { dateFormats } from '@constants/date'
import { ValidationRules } from '@constants/form/validationRules'

import SearchAppByToken from '@ui/SearchAppByToken'

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
  const columns: ColumnsType<ApplicationTokenType> = [
    {
      title: 'Токен',
      dataIndex: 'token',
      width: 130,
      render: (value: string) =>
        value.length > 6 ? `${value.slice(0, 3)}…${value.slice(-3)}` : value
    },
    {
      title: 'Выпущен',
      dataIndex: 'createdAt',
      width: 190,
      render: (value: string) => dayjs(value).format(dateFormats.fullFormat)
    },
    {
      title: 'Срок действия',
      dataIndex: 'expireTime',
      width: 190,
      render: (value: number, record) => {
        if (value === -1) return 'Бессрочно'
        const expiry = dayjs(record.createdAt).add(value, 'millisecond')
        return expiry.isBefore(dayjs())
          ? 'Истёк'
          : expiry.format(dateFormats.fullFormat)
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space.Compact>
          <Tooltip title="Скопировать токен">
            <Button
              className="copy-btn"
              aria-label="Скопировать токен"
              icon={<CopyOutlined />}
              data-clipboard-text={record.token}
            />
          </Tooltip>
          {canRemove && (
            <Popconfirm
              title="Отозвать токен?"
              description="Приложение больше не сможет использовать этот токен."
              okText="Отозвать"
              cancelText="Отмена"
              onConfirm={() => revoke(record.token)}
            >
              <Button
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
        </Space.Compact>
      )
    }
  ]

  if (!canView) return <Result status="403" title="Нет доступа к токенам" />
  return (
    <section className="token-content">
      <header className="token-content__header">
        <h3>Токены приложения</h3>
        <SearchAppByToken />
        <Button loading={query.isFetching} onClick={() => query.refetch()}>
          Обновить токены
        </Button>
        {canAdd && (
          <Button type="primary" disabled={busy} onClick={() => setOpen(true)}>
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
            <Button loading={query.isFetching} onClick={() => query.refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <Table<ApplicationTokenType>
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
      <Modal
        title="Выпуск токена"
        open={open}
        onCancel={close}
        destroyOnHidden
        mask={{ closable: false }}
        keyboard={!busy}
        closable={!busy}
        footer={null}
      >
        <form onSubmit={issueToken}>
          <p>Выберите срок действия нового токена приложения.</p>
          <FormSelect
            control={control}
            name="expireTime"
            label="Срок действия"
            options={lifetimeOptions}
            rules={{ required: ValidationRules.required }}
            disabled={busy}
          />
          <div className="token-content__form-actions">
            <Button onClick={close} disabled={busy}>
              Отмена
            </Button>
            <Button
              htmlType="submit"
              type="primary"
              loading={isSubmitting}
              disabled={busy}
            >
              Выпустить токен
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export default TokenContent
