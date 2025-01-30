import {
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
  SwapOutlined
} from '@ant-design/icons'
import { Button, message, Popconfirm, Spin, Table, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'

import { dateFormats } from '@constants/date.ts'

import CanEdit from '@components/CanEdit'
import CompareVersionModal from '@components/CompareVersionModal'
import ConfigurationPreviewModal from '@components/ConfigurationPreviewModal'

import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import { useAppSelector } from '@hooks/redux.ts'
import useRole from '@hooks/useRole.tsx'

import configServiceApi from '@services/configService.ts'
import userServiceApi from '@services/userService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'
import { VersionType } from '@type/version.type.ts'

import './all-versions-page.scss'

const AllVersionsPage = () => {
  const [showCompareModal, setShowCompareModal] = useState<boolean>(false)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)

  const [currentClickVersion, setCurrentClickVersion] = useState<VersionType>(
    {} as VersionType
  )
  const navigate = useNavigate()
  const { id = '', configId = '' } = useParams()
  const {
    data: versions = [],
    isLoading: isVersionLoading,
    isError: isVersionError
  } = configServiceApi.useGetAllVersionQuery(configId)
  const {
    data: currentConfig,
    isLoading: isCurrentConfigLoading,
    isError: isCurrentConfigError
  } = configServiceApi.useGetConfigByIdQuery(configId)
  const [deleteVersion] = configServiceApi.useDeleteVersionMutation()
  const [createUpdateConfig] = configServiceApi.useCreateUpdateConfigMutation()

  const {
    data: allUsers = [],
    isLoading: isUsersLoading,
    isError: isUsersError
  } = userServiceApi.useGetAllUsersQuery()
  const { profile } = useAppSelector((state) => state.profileReducer)

  const { role, hasPermission } = useRole()

  const isLoading = isVersionLoading || isCurrentConfigLoading || isUsersLoading
  const isError = isVersionError || isCurrentConfigError || isUsersError
  const isPageAvailable = hasPermission(PermissionKeysType.read)

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

  if (isLoading) {
    return <Spin />
  }
  if (isError) {
    return <Navigate to={routePaths.error} />
  }

  const handeRemoveVersion = (versionId: string) => {
    deleteVersion(versionId)
      .unwrap()
      .then(() => {
        message.success('Элемент успешно удален')
      })
      .catch(() => {
        message.error('Не удалось удалить элемент')
      })
  }
  const handleRevertVersion = (newData: Record<string, unknown>) => {
    const sendData = { ...currentConfig, data: newData } as ConfigType
    createUpdateConfig(sendData)
      .unwrap()
      .then(() => {
        message.success('Версия успешно восстановлена')
      })
      .catch(() => {
        message.error('Не удалось восстановить версию')
      })
  }
  const renderActionsField = (_: unknown, record: VersionType) => {
    return (
      <div className="all-version-page__actions-field">
        <Button.Group className="button_group">
          <CanEdit>
            <Tooltip title="Установить выбранную версию">
              <Popconfirm
                title="Вы действительно хотите установить выбранную версию ?"
                onConfirm={() => handleRevertVersion(record.data)}
              >
                <Button icon={<ReloadOutlined />} />
              </Popconfirm>
            </Tooltip>
          </CanEdit>
          <Tooltip title="Просмотр версии">
            <Button
              onClick={() => {
                setCurrentClickVersion(record)
                setShowPreviewModal(true)
              }}
              icon={<EyeOutlined />}
            />
          </Tooltip>
          <Tooltip title="Сравнение версий">
            <Button
              onClick={() => {
                setCurrentClickVersion(record)
                setShowCompareModal(true)
              }}
              icon={<SwapOutlined />}
            />
          </Tooltip>
          <CanEdit>
            <Popconfirm
              title="Вы действительно хотите удалить выбранную версию ?"
              onConfirm={() => handeRemoveVersion(record.id)}
            >
              <Button danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </CanEdit>
        </Button.Group>
      </div>
    )
  }
  const columns: ColumnsType<VersionType> = [
    {
      key: 'configVersion',
      title: 'Версия',
      dataIndex: 'configVersion'
    },
    {
      key: 'createdAt',
      title: 'Создано',
      dataIndex: 'createdAt',
      render: (value: string) => {
        return dayjs(value).format(dateFormats.fullFormat)
      }
    },
    {
      key: 'user',
      title: 'Автор',
      dataIndex: 'adminId',
      render: (value: number) => {
        const user = allUsers.find((user) => user.id === value)
        if (user) {
          return `${user.lastName} ${user.firstName}`
        }
        return `${profile.lastName} ${profile.firstName}`
      }
    },
    {
      key: 'actions',
      title: 'Действия',
      dataIndex: 'actions',
      render: renderActionsField
    }
  ]
  return (
    <section className="all-version-page">
      {showPreviewModal && (
        <ConfigurationPreviewModal
          versionCompare={true}
          config={currentClickVersion}
          open={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
      {showCompareModal && (
        <CompareVersionModal
          currentConfigId={currentConfig?.id || ''}
          config={currentClickVersion}
          open={showCompareModal}
          onClose={() => setShowCompareModal(false)}
        />
      )}
      <Button
        className="all-version-page__back-btn"
        onClick={() => navigate(`${routePaths.modules}/${id}/configurations`)}
      >
        Назад
      </Button>
      <div className="all-version-page__table">
        <Table
          columns={columns}
          dataSource={versions}
          pagination={{ pageSize: 30 }}
          rowKey={(record) => record.id}
        />
      </div>
    </section>
  )
}

export default AllVersionsPage
