import { DeleteOutlined, EditOutlined, ExportOutlined } from '@ant-design/icons'
import { Popconfirm, TableColumnType, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { TableActionButton, TableActions, TableDate } from '@components/TableUI'
import {
  Filters,
  Sorts
} from '@components/VariablesComponents/VariablesTable/variables-table.type'

import {
  deleteConfirmation,
  irreversibleDelete
} from '@utils/deleteConfirmation'

import { useColumnSearch } from '@hooks/useColumnsSearch'
import useRole from '@hooks/useRole'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import { matchesVariableSearch } from './variableTableState'

const renderText = (value?: string) =>
  value ? (
    <Tooltip
      title={value}
      trigger={['hover', 'focus']}
      classNames={{ container: 'variables-table__tooltip' }}
    >
      <span className="variables-table__text" tabIndex={0}>
        {value}
      </span>
    </Tooltip>
  ) : (
    '—'
  )

export const useVariableColumns = (
  sortedInfo: Sorts,
  filteredInfo: Filters,
  onRemoveVariable: (name: string) => void | Promise<void>,
  compact: boolean,
  removingName?: string
): TableColumnType<VariableType>[] => {
  const navigate = useNavigate()
  const { search } = useLocation()
  const { hasPermission } = useRole()
  const { getColumnSearchProps } = useColumnSearch<VariableType>()
  const canEditPermission = hasPermission(PermissionKeysType.variable_edit)
  const canRemovePermission = hasPermission(PermissionKeysType.variable_delete)
  const isModulesPageAvailable = hasPermission(
    PermissionKeysType.module_configuration_edit
  )
  const renderType = (type: VariableType['type']) => (
    <Tag color={type === 'TEXT' ? 'green' : 'orange'}>
      {type === 'TEXT' ? 'ТЕКСТ' : 'СЕКРЕТ'}
    </Tag>
  )
  const renderValue = (record: VariableType) =>
    record.type === 'SECRET' ? 'Скрыто' : renderText(record.value)

  const columns: TableColumnType<VariableType>[] = [
    {
      title: 'Наименование',
      dataIndex: 'name',
      key: 'name',
      width: compact ? undefined : 200,
      align: 'left',
      sorter: (a, b) => a.name.localeCompare(b.name),
      sortOrder: sortedInfo.columnKey === 'name' ? sortedInfo.order : null,
      ...getColumnSearchProps('name', filteredInfo),
      render: (name: string, record) => (
        <>
          <Tooltip
            title={name}
            trigger={['hover', 'focus']}
            classNames={{ container: 'variables-table__tooltip' }}
          >
            <Link
              className="variables-table__name admin-table-name"
              to={{ pathname: `${routePaths.variables}/${name}`, search }}
            >
              {name}
            </Link>
          </Tooltip>
          {compact && (
            <div className="admin-table-compact-details admin-table-meta">
              {renderType(record.type)}
              {renderValue(record)}
            </div>
          )}
        </>
      )
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      hidden: compact,
      key: 'description',
      className: 'admin-table-meta',
      align: 'left',
      width: 200,
      render: renderText
    },
    {
      title: 'Тип',
      dataIndex: 'type',
      hidden: compact,
      key: 'type',
      width: 100,
      align: 'center',
      sorter: (a, b) => a.type.localeCompare(b.type),
      sortOrder: sortedInfo.columnKey === 'type' ? sortedInfo.order : null,
      render: renderType
    },
    {
      title: 'Значение',
      dataIndex: 'value',
      hidden: compact,
      key: 'value',
      align: 'left',
      width: 200,
      ...getColumnSearchProps('value', filteredInfo),
      onFilter: (value, record) =>
        record.type === 'TEXT' &&
        matchesVariableSearch(record.value, String(value)),
      render: (_, record) => renderValue(record)
    },
    {
      title: 'Используется в конфигурациях',
      dataIndex: 'containsInConfigs',
      hidden: compact,
      key: 'containsInConfigs',
      align: 'left',
      width: 200,
      render: (configs) => {
        if (!configs || configs.length === 0) {
          return 'Не используется'
        }
        return (
          <ul className="variables-table__configurations">
            {configs.map(
              (config: VariableType['containsInConfigs'][number]) => (
                <li
                  data-testid="variable-table-columns__list-element"
                  className="variable-table-columns__list-element"
                  key={config.id}
                >
                  {isModulesPageAvailable ? (
                    <Tooltip
                      title={`${config.name} — откроется в новой вкладке`}
                      trigger={['hover', 'focus']}
                      classNames={{ container: 'variables-table__tooltip' }}
                    >
                      <a
                        className="variables-table__configuration-link"
                        href={`/${config.moduleId}/configEditor/${config.id}`}
                        aria-label={`${config.name} — откроется в новой вкладке`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="variables-table__text">
                          {config.name}
                        </span>{' '}
                        <ExportOutlined aria-hidden />
                      </a>
                    </Tooltip>
                  ) : (
                    renderText(config.name)
                  )}
                </li>
              )
            )}
          </ul>
        )
      }
    },
    {
      title: 'Дата создания',
      dataIndex: 'createdAt',
      hidden: compact,
      key: 'createdAt',
      width: 200,
      align: 'left',
      sorter: (a, b) =>
        dayjs(a.createdAt).valueOf() - dayjs(b.createdAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'createdAt' ? sortedInfo.order : null,
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Дата обновления',
      dataIndex: 'updatedAt',
      hidden: compact,
      key: 'updatedAt',
      width: 200,
      align: 'left',
      sorter: (a, b) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      sortOrder: sortedInfo.columnKey === 'updatedAt' ? sortedInfo.order : null,
      render: (value) => <TableDate value={value} />
    },
    {
      title: 'Действия',
      dataIndex: 'actions',
      key: 'actions',
      width: compact ? 90 : 150,
      align: 'right',
      render: (_, record) => {
        const isUsedInConfigs = Boolean(record.containsInConfigs?.length)
        return (
          <TableActions>
            {canEditPermission && (
              <Tooltip title="Редактировать переменную">
                <TableActionButton
                  data-testid="variables-table__edit-config-btn"
                  icon={<EditOutlined />}
                  aria-label={`Редактировать переменную ${record.name}`}
                  disabled={Boolean(removingName)}
                  onClick={() =>
                    navigate({
                      pathname: `${routePaths.variables}/${record.name}`,
                      search
                    })
                  }
                />
              </Tooltip>
            )}
            {canRemovePermission && (
              <Popconfirm
                disabled={isUsedInConfigs || Boolean(removingName)}
                title={`Удалить переменную «${record.name}»?`}
                description={irreversibleDelete}
                {...deleteConfirmation}
                onConfirm={() => onRemoveVariable(record.name)}
              >
                <Tooltip
                  title={
                    isUsedInConfigs
                      ? 'Переменная используется в конфигурациях'
                      : 'Удалить'
                  }
                >
                  <TableActionButton
                    data-testid="variables-table__delete-config-btn"
                    icon={<DeleteOutlined />}
                    aria-label={`Удалить переменную ${record.name}`}
                    danger
                    loading={removingName === record.name}
                    disabled={isUsedInConfigs || Boolean(removingName)}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </TableActions>
        )
      }
    }
  ]
  return columns.filter(
    (column) =>
      column.key !== 'actions' || canEditPermission || canRemovePermission
  )
}
