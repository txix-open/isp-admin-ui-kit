import {
  ArrowLeftOutlined,
  ClearOutlined,
  DeleteOutlined,
  EyeOutlined,
  EllipsisOutlined,
  ReloadOutlined,
  SwapOutlined
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Dropdown,
  Modal,
  message,
  Popconfirm,
  Table,
  Tooltip
} from 'antd'
import { ColumnsType } from 'antd/es/table'
import { Key, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import CompareVersionModal from '@components/CompareVersionModal'
import ConfigurationPreviewModal from '@components/ConfigurationPreviewModal'
import {
  TableActionButton,
  TableActions,
  TableDate,
  TableStatus
} from '@components/TableUI'

import { ConfigType } from '@pages/ModulesPage/module.type'

import { notifyApiError } from '@utils/apiErrorNotifications'
import {
  deleteConfirmation,
  irreversibleDelete
} from '@utils/deleteConfirmation'

import useRole from '@hooks/useRole'

import configServiceApi from '@services/configService'
import userServiceApi from '@services/userService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'
import { VersionType } from '@type/version.type'

import './all-versions-page.scss'

const AllVersionsPage = () => {
  const [comparison, setComparison] = useState<[VersionType, VersionType]>()
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)

  const [currentClickVersion, setCurrentClickVersion] = useState<VersionType>(
    {} as VersionType
  )
  const [selectedVersionIds, setSelectedVersionIds] = useState<Key[]>([])
  const [modal, contextHolder] = Modal.useModal()
  const navigate = useNavigate()
  const { search, state } = useLocation()
  const { id = '', configId = '' } = useParams()
  const {
    currentData: versions = [],
    isLoading: isVersionLoading,
    isError: isVersionError,
    isFetching: isVersionsFetching,
    refetch: refetchVersions
  } = configServiceApi.useGetAllVersionQuery(configId)
  const {
    currentData: currentConfig,
    isLoading: isCurrentConfigLoading,
    isError: isCurrentConfigError,
    isFetching: isConfigFetching,
    refetch: refetchConfig
  } = configServiceApi.useGetConfigByIdQuery(configId)
  const [deleteVersion, { isLoading: isDeleting }] =
    configServiceApi.useDeleteVersionMutation()
  const [createUpdateConfig, { isLoading: isRestoring }] =
    configServiceApi.useCreateUpdateConfigMutation()

  const { data: allUsers = [], isError: isUsersError } =
    userServiceApi.useGetAllUsersQuery()

  const { role, hasPermission } = useRole()

  const isLoading = isVersionLoading || isCurrentConfigLoading
  const isError = isVersionError || isCurrentConfigError
  const isBusy = isDeleting || isRestoring
  const selectedVersions = versions
    .filter((version) => selectedVersionIds.includes(version.id))
    .sort((a, b) => a.configVersion - b.configVersion)
  const isCurrentVersion = (version: VersionType) =>
    currentConfig?.version === version.configVersion

  useEffect(() => {
    setSelectedVersionIds([])
    setComparison(undefined)
    setShowPreviewModal(false)
  }, [configId])
  const isPageAvailable = hasPermission(PermissionKeysType.module_view)
  const canSetVersion = hasPermission(PermissionKeysType.module_history_set)
  const canRemoveVersion = hasPermission(
    PermissionKeysType.module_history_delete_version
  )

  useEffect(() => {
    if (!isPageAvailable) {
      navigate(routePaths.home)
    }
  }, [isPageAvailable])
  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  const header = (
    <header className="all-version-page__header">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          navigate(
            {
              pathname: `${routePaths.modules}/${id}/configurations`,
              search
            },
            { state: { moduleScrollTop: state?.moduleScrollTop ?? 0 } }
          )
        }
      >
        К конфигурациям
      </Button>
      <div className="all-version-page__heading">
        <h2 className="all-version-page__title">История версий</h2>
        <span
          className="all-version-page__config-name"
          title={currentConfig?.name || `ID: ${configId}`}
        >
          {currentConfig?.name || `ID: ${configId}`}
        </span>
      </div>
    </header>
  )

  const handleRemoveVersion = (versionId: string) => {
    return deleteVersion(versionId)
      .unwrap()
      .then(() => {
        setSelectedVersionIds((ids) => ids.filter((id) => id !== versionId))
        message.success('Версия успешно удалена')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось удалить версию конфигурации')
      })
  }
  const handleRevertVersion = (newData: Record<string, unknown>) => {
    const sendData = { ...currentConfig, data: newData } as ConfigType
    return createUpdateConfig(sendData)
      .unwrap()
      .then(() => {
        message.success('Версия успешно восстановлена')
      })
      .catch((error) => {
        notifyApiError(error, 'Не удалось восстановить версию')
      })
  }
  const renderActionsField = (_: unknown, record: VersionType) => (
    <div className="all-version-page__actions-field">
      <TableActions>
        <Tooltip title="Просмотреть версию">
          <TableActionButton
            aria-label={`Просмотреть версию ${record.configVersion}`}
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentClickVersion(record)
              setShowPreviewModal(true)
            }}
          />
        </Tooltip>
        {canSetVersion && !isCurrentVersion(record) && (
          <Popconfirm
            title={`Восстановить версию ${record.configVersion}?`}
            description="Конфигурация будет сохранена с данными выбранной версии."
            onConfirm={() => handleRevertVersion(record.data)}
            okText="Восстановить"
            cancelText="Отмена"
            okButtonProps={{ loading: isRestoring }}
            disabled={isBusy || !currentConfig || isCurrentConfigError}
          >
            <Tooltip title="Восстановить версию">
              <TableActionButton
                aria-label={`Восстановить версию ${record.configVersion}`}
                disabled={isBusy || !currentConfig || isCurrentConfigError}
                icon={<ReloadOutlined />}
              />
            </Tooltip>
          </Popconfirm>
        )}
        {canRemoveVersion && (
          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'delete',
                  label: 'Удалить версию',
                  icon: <DeleteOutlined />,
                  danger: true,
                  disabled: isBusy,
                  onClick: () =>
                    modal.confirm({
                      title: `Удалить версию ${record.configVersion}?`,
                      content: irreversibleDelete,
                      ...deleteConfirmation,
                      onOk: () => handleRemoveVersion(record.id)
                    })
                }
              ]
            }}
          >
            <TableActionButton
              aria-label={`Другие действия версии ${record.configVersion}`}
              icon={<EllipsisOutlined />}
            />
          </Dropdown>
        )}
      </TableActions>
    </div>
  )
  const columns: ColumnsType<VersionType> = [
    {
      key: 'configVersion',
      title: 'Версия',
      dataIndex: 'configVersion',
      width: 230,
      render: (value: number, record) => (
        <div className="all-version-page__table__current-version-cell">
          <span className="admin-table-name admin-table-number">{value}</span>
          {isCurrentVersion(record) && (
            <TableStatus tone="info">Текущая версия</TableStatus>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      title: 'Создано',
      dataIndex: 'createdAt',
      width: 150,
      render: (value: string) => <TableDate value={value} />
    },
    {
      key: 'user',
      title: 'Автор',
      dataIndex: 'adminId',
      render: (value: number) => {
        const user = allUsers.find((user) => String(user.id) === String(value))
        const name =
          user && [user.lastName, user.firstName].filter(Boolean).join(' ')
        return (
          name || (value != null ? `ID: ${value}` : 'Неизвестный пользователь')
        )
      }
    },
    {
      key: 'actions',
      title: 'Действия',
      dataIndex: 'actions',
      width: 152,
      align: 'right',
      render: renderActionsField
    }
  ]
  return (
    <section className="all-version-page">
      {contextHolder}
      {header}
      {isError && (
        <Alert
          type="error"
          showIcon
          title="Не удалось загрузить историю версий"
          description="Повторите загрузку. Ранее полученные данные останутся видимыми."
          action={
            <Button
              disabled={isVersionsFetching || isConfigFetching}
              onClick={() => {
                void refetchVersions()
                void refetchConfig()
              }}
            >
              Повторить
            </Button>
          }
        />
      )}
      {isUsersError && (
        <Alert
          type="warning"
          showIcon
          title="Не удалось загрузить авторов. Показаны их идентификаторы."
        />
      )}
      <div className="all-version-page__selection">
        <span role="status" aria-live="polite">
          {selectedVersions.length === 0
            ? 'Выберите две версии'
            : selectedVersions.length === 1
              ? `Версия ${selectedVersions[0].configVersion} — выберите вторую`
              : `Версии ${selectedVersions[0].configVersion} → ${selectedVersions[1].configVersion}`}
        </span>
        <Button
          icon={<SwapOutlined />}
          disabled={selectedVersions.length !== 2}
          onClick={() => {
            if (selectedVersions.length === 2) {
              setComparison([selectedVersions[0], selectedVersions[1]])
            }
          }}
        >
          Сравнить выбранные
        </Button>
        <Button
          icon={<ClearOutlined />}
          disabled={selectedVersions.length === 0}
          onClick={() => setSelectedVersionIds([])}
        >
          Сбросить
        </Button>
      </div>
      {showPreviewModal && (
        <ConfigurationPreviewModal
          versionCompare={true}
          config={currentClickVersion}
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
      {comparison && (
        <CompareVersionModal
          versions={comparison}
          configName={currentConfig?.name || `ID: ${configId}`}
          open
          onClose={() => setComparison(undefined)}
        />
      )}
      <div className="all-version-page__table admin-table">
        <Table
          columns={columns}
          loading={isLoading}
          size="middle"
          rowSelection={{
            selectedRowKeys: selectedVersions.map((version) => version.id),
            onChange: (keys) => setSelectedVersionIds(keys.slice(0, 2)),
            hideSelectAll: true,
            columnWidth: 40,
            getCheckboxProps: (record) => ({
              disabled:
                selectedVersions.length >= 2 &&
                !selectedVersionIds.includes(record.id),
              'aria-label': `Выбрать версию ${record.configVersion} для сравнения`
            })
          }}
          locale={{
            emptyText: isError
              ? 'История версий недоступна'
              : 'История версий пока пуста'
          }}
          dataSource={versions}
          pagination={{ pageSize: 30, hideOnSinglePage: true }}
          rowKey={(record) => record.id}
          scroll={{ x: 700 }}
        />
      </div>
    </section>
  )
}

export default AllVersionsPage
