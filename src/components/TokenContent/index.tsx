import { CopyOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, message, Popconfirm, Spin, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import ClipboardJS from 'clipboard'
import dayjs from 'dayjs'
import 'dayjs/locale/ru'
import duration from 'dayjs/plugin/duration'
import relativeTime from 'dayjs/plugin/relativeTime'
import { FormComponents, Layout } from 'isp-ui-kit'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { dateFormats } from '@constants/date.ts'
import { ValidationRules } from '@constants/form/validationRules.ts'

import Modal from '@widgets/Modal'

import CanEdit from '@components/CanEdit'

import {
  ApplicationTokenType,
  NewApplicationTokenType
} from '@pages/ApplicationsPage/applications.type.ts'

import tokensApi from '@services/tokensService.ts'

import './tokens.scss'

const { FormSelect } = FormComponents
const { EmptyData } = Layout

interface TokenPropTypes {
  id: number
}

// eslint-disable-next-line import/no-named-as-default-member
dayjs.locale('ru')
dayjs.extend(duration)
dayjs.extend(relativeTime)

const TokenContent = ({ id }: TokenPropTypes) => {
  const [showApplicationsModal, setShowApplicationsModal] = useState(false)
  const {
    handleSubmit: handleSubmitTokens,
    control: controlTokens,
    reset
  } = useForm<ApplicationTokenType>({
    mode: 'onChange'
  })

  const { data, isLoading } = tokensApi.useGetTokensByAppIdQuery({ id })
  const [createToken] = tokensApi.useCreateTokenMutation()
  const [revokeToken] = tokensApi.useRevokeTokensMutation()

  useEffect(() => {
    const clipboard = new ClipboardJS('.copy-btn')
    clipboard.on('success', () => {
      message.success('Токен скопирован в буфер обмена')
    })
    clipboard.on('error', () => {
      message.error('Ошибка копирования')
    })

    return () => {
      clipboard.destroy()
    }
  }, [])

  const handleCreateToken = (data: any) => {
    if (id) {
      const newToken: NewApplicationTokenType = {
        expireTimeMs: data.expireTime,
        appId: Number(id)
      }

      createToken(newToken)
        .then(() => {
          setShowApplicationsModal(false)
          reset()
          message.success('Элемент добавлен')
        })
        .catch(() => {
          message.error('Ошибка добавления элемента')
        })
    }
  }

  function shortenString(longString: string) {
    if (longString.length <= 6) {
      return <span>{longString}</span>
    } else {
      return (
        <span>
          {longString.slice(0, 3)}...{longString.slice(-3)}
        </span>
      )
    }
  }

  const handleRevokeToken = (elem: ApplicationTokenType) => {
    const currentRemoveToken = {
      appId: id,
      tokens: [elem.token]
    }

    revokeToken(currentRemoveToken)
      .unwrap()
      .then(() => message.success('Элемент удален'))
      .catch(() => message.error('Ошибка удаления элемента'))
  }

  const columns: ColumnsType<ApplicationTokenType> = [
    {
      title: 'Токен',
      dataIndex: 'token',
      key: 'token',
      render: (value) => <div>{shortenString(value)}</div>
    },
    {
      title: 'Дата/Время выпуска',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) => {
        const formatTime = dayjs(value).format(dateFormats.fullFormat)
        return <div>{formatTime}</div>
      }
    },
    {
      title: 'Истекает',
      dataIndex: 'expireTime',
      key: 'expireTime',
      render: (value, record) => {
        if (value === -1) {
          return <span>Никогда</span>
        }

        const dateNow = dayjs()
        const expireTime = dayjs(record.createdAt).add(value)
        if (expireTime.isBefore(dateNow)) {
          return <span>Просрочен</span>
        }

        const formatTime = expireTime.format(dateFormats.fullFormat)
        return <span>{formatTime}</span>
      }
    },
    {
      title: 'Действия',
      dataIndex: 'token',
      key: 'actions',
      render: (value, record) => {
        return (
          <Button.Group>
            <Tooltip title="Скопировать">
              <Button
                className="copy-btn"
                icon={<CopyOutlined />}
                data-clipboard-text={value}
              />
            </Tooltip>
            <Tooltip title="Удалить">
              <Popconfirm
                title="Закончить эту сессию?"
                onConfirm={() => handleRevokeToken(record)}
              >
                <Button icon={<DeleteOutlined />} />
              </Popconfirm>
            </Tooltip>
          </Button.Group>
        )
      }
    }
  ]

  const tokensOptions = useMemo(
    () => [
      {
        value: -1,
        label: 'Бессрочно'
      },
      {
        value: 3600000,
        label: 'Один час'
      },
      {
        value: 86400000,
        label: 'Один день'
      },
      {
        value: 2592000000,
        label: '30 дней'
      },
      {
        value: 31536000000,
        label: 'Один год'
      }
    ],
    []
  )
  if (!id) {
    return <EmptyData />
  }

  if (isLoading) {
    return <Spin className="spin" />
  }

  const handleShowAddModalToken = () => {
    setShowApplicationsModal(true)
  }

  return (
    <section className="token-content">
      <div className="token-content__wrap">
        <header className="token-content__header">
          <h3>Токены</h3>
          <CanEdit>
            <Button
              className="applications-content__add-btn"
              type="primary"
              onClick={handleShowAddModalToken}
            >
              Добавить токен
            </Button>
          </CanEdit>
        </header>
        <div className="token-content__table">
          <Table
            className="appliactions-tokent__table"
            rowKey={(record) => record.createdAt}
            pagination={false}
            columns={columns}
            dataSource={data}
          />
        </div>
        <Modal
          onOk={handleSubmitTokens(handleCreateToken)}
          title="Добавить"
          open={showApplicationsModal}
          footer={{ onCanselText: 'Отмена', onOkText: 'Сохранить' }}
          onClose={() => setShowApplicationsModal(false)}
        >
          <form>
            <FormSelect
              options={tokensOptions}
              name="expireTime"
              control={controlTokens}
              label="Время действия"
              rules={{ required: ValidationRules.required }}
            />
          </form>
        </Modal>
      </div>
    </section>
  )
}

export default TokenContent
