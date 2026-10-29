import { CheckOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons'
import { Button, message, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { FC, useEffect, useId, useRef, useState } from 'react'

import { dateFormats } from '@constants/date'

import ActiveTableActionButtons from '@widgets/ActiveTableActionButtons'

import { ActiveConfigurationsTablePropsType } from '@components/ActiveConfigurationsTable/active-configurations-table.type'
import { TableActionButton, TableDate, TableStatus } from '@components/TableUI'

import { ConfigType } from '@pages/ModulesPage/module.type'

import { notifyApiError } from '@utils/apiErrorNotifications'

import useRole from '@hooks/useRole'

import configApi from '@services/configService'

import { PermissionKeysType } from '@type/roles.type'

import './active-configurations-table.scss'

const ActiveConfigurationsTable: FC<ActiveConfigurationsTablePropsType> = ({
  isActiveTable = false,
  loading = false,
  loadFailed = false,
  handleShowConfig,
  data
}) => {
  const { hasPermission } = useRole()
  const [editKeyConfig, setEditKeyConfig] = useState<string>('')
  const [draftName, setDraftName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const tableId = useId()
  const [updateConfigName, { isLoading: isRenaming }] =
    configApi.useUpdateConfigNameMutation()
  const [markConfigAsActive] = configApi.useMarkConfigAsActiveMutation()
  const [deleteConfig, { isLoading: isDeleting }] =
    configApi.useDeleteConfigMutation()

  const canEditConfig = hasPermission(
    PermissionKeysType.module_configuration_edit
  )

  useEffect(() => {
    inputRef.current?.focus()
    inputRef.current?.select()
  }, [editKeyConfig])
  const handleEditStart = (record: ConfigType) => {
    if (isRenaming) return
    setEditKeyConfig(record.id)
    setDraftName(record.name)
  }

  const handleCancelEdit = (record: ConfigType) => {
    if (isRenaming) return
    setEditKeyConfig('')
    requestAnimationFrame(() =>
      document.getElementById(`${tableId}-rename-${record.id}`)?.focus()
    )
  }

  const handleSaveEdit = (record: ConfigType) => {
    const name = draftName.trim()
    if (!name || name === record.name.trim() || isRenaming) return
    const sendData = { id: record.id, newConfigName: name }
    updateConfigName(sendData)
      .unwrap()
      .then(() => {
        message.success('Элемент успешно сохранен')
        setEditKeyConfig('')
        requestAnimationFrame(() =>
          document.getElementById(`${tableId}-rename-${record.id}`)?.focus()
        )
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось сохранить элемент')
      })
  }
  const handleDeleteConfig = (record: ConfigType) => {
    if (isDeleting) return
    return deleteConfig(record.id)
      .unwrap()
      .then(() => {
        message.success('Конфигурация удалена')
        setEditKeyConfig('')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось удалить конфигурацию')
      })
  }

  const handleMarkConfigActive = (record: ConfigType) => {
    markConfigAsActive(record.id)
      .unwrap()
      .then(() => {
        message.success('Элемент успешно обновлен')
        setEditKeyConfig('')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось обновить элемент')
      })
  }

  const renderNameField = (value: string, record: ConfigType) => {
    const canEdit = editKeyConfig === record.id
    const nameUnchanged = draftName.trim() === record.name.trim()

    return (
      <div className="active-configurations-table__name-cell">
        <div
          className={`active-configurations-table__table__name-field ${canEdit ? 'active-configurations-table__table__name-field--editing' : ''}`}
        >
          {canEdit ? (
            <input
              ref={inputRef}
              aria-label="Название конфигурации"
              onChange={(event) => setDraftName(event.target.value)}
              disabled={isRenaming}
              value={draftName}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  handleSaveEdit(record)
                }
                if (event.key === 'Escape') {
                  event.preventDefault()
                  handleCancelEdit(record)
                }
              }}
            />
          ) : (
            <Tooltip title={value}>
              <Button
                type="link"
                className="active-configurations-table__name-button admin-table-name"
                aria-label={`Просмотреть конфигурацию «${value || record.id}»`}
                onClick={() => handleShowConfig(record)}
              >
                {value || `ID: ${record.id}`}
              </Button>
            </Tooltip>
          )}
          {canEdit ? (
            <div className="active-configurations-table__table__name-field__actions">
              <Tooltip title="Сохранить название (Enter)">
                <TableActionButton
                  aria-label="Сохранить название"
                  loading={isRenaming}
                  disabled={!draftName.trim() || nameUnchanged}
                  type="primary"
                  onClick={() => handleSaveEdit(record)}
                  icon={<CheckOutlined />}
                />
              </Tooltip>
              <Tooltip title="Отменить переименование (Esc)">
                <TableActionButton
                  aria-label="Отменить переименование"
                  disabled={isRenaming}
                  onClick={() => handleCancelEdit(record)}
                  icon={<CloseOutlined />}
                />
              </Tooltip>
            </div>
          ) : (
            canEditConfig && (
              <Tooltip title="Редактировать название">
                <TableActionButton
                  type="text"
                  id={`${tableId}-rename-${record.id}`}
                  aria-label={`Переименовать конфигурацию «${value}»`}
                  disabled={isRenaming}
                  onClick={() => handleEditStart(record)}
                  icon={<EditOutlined />}
                />
              </Tooltip>
            )
          )}
        </div>
        <div className="active-configurations-table__mobile-meta">
          <span>
            Версия {record.version} ·{' '}
            {record.valid ? 'Корректная' : 'Некорректная'}
          </span>
          <span>
            {record.updatedAt && dayjs(record.updatedAt).isValid()
              ? dayjs(record.updatedAt).format(dateFormats.fullFormat)
              : '—'}
          </span>
        </div>
      </div>
    )
  }

  const columns: ColumnsType<ConfigType> = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: renderNameField,
      align: 'left'
    },
    {
      title: 'Версия',
      dataIndex: 'version',
      key: 'version',
      width: 72,
      responsive: ['md'],
      render: (value: number) => (
        <span className="active-configurations-table__version">{value}</span>
      ),
      align: 'center'
    },
    {
      title: 'Статус',
      dataIndex: 'valid',
      key: 'valid',
      width: '20%',
      responsive: ['md'],
      align: 'center',
      render: (value: boolean) => (
        <TableStatus tone={value ? 'success' : 'error'}>
          {value ? 'Корректная' : 'Некорректная'}
        </TableStatus>
      )
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '20%',
      responsive: ['xl'],
      align: 'left',
      render: (value: string) => <TableDate value={value} />
    },
    {
      title: 'Действия',
      className: 'active-configurations-table__actions-cell',
      dataIndex: 'actions',
      key: 'actions',
      width: 'var(--configuration-actions-width, 144px)',
      align: 'right',
      render: (_: unknown, record: ConfigType) => (
        <ActiveTableActionButtons
          isActive={isActiveTable}
          isDeleting={isDeleting}
          handleDeleteConfig={handleDeleteConfig}
          handleMarkConfigActive={handleMarkConfigActive}
          record={record}
        />
      )
    }
  ]
  const className = `active-configurations-table__table ${isActiveTable ? 'active-config' : ''}`
  const getEmptyText = () => {
    if (loading) return 'Загрузка конфигураций…'
    if (loadFailed) return 'Данные конфигураций недоступны'
    return isActiveTable
      ? 'Активная конфигурация пока не выбрана'
      : 'Других конфигураций пока нет'
  }
  return (
    <div
      className={`active-configurations-table ${isActiveTable ? 'active-configurations-table--active' : ''}`}
    >
      <div className="active-configurations-table__buttons">
        <h2 className="active-configurations-table__title">
          {isActiveTable ? 'Активная' : 'Остальные'}
          {!loading && !loadFailed && (
            <span
              className="active-configurations-table__count admin-table-meta admin-table-number"
              aria-label="Количество конфигураций"
            >
              {data.length}
            </span>
          )}
        </h2>
      </div>
      <Table
        loading={loading}
        locale={{ emptyText: getEmptyText() }}
        className={`${className} admin-table`}
        size="middle"
        rowKey={(record) => record.id}
        rowClassName={(record) =>
          record.active === true ? 'configuration-row--active' : ''
        }
        pagination={false}
        columns={columns}
        tableLayout="fixed"
        dataSource={data}
      />
    </div>
  )
}

export default ActiveConfigurationsTable
