import {
  CheckCircleOutlined,
  DeleteOutlined,
  FormOutlined,
  HistoryOutlined,
  EllipsisOutlined,
  CopyOutlined
} from '@ant-design/icons'
import { Dropdown, message, Modal, Popconfirm, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import { FC, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { TableActionButton, TableActions } from '@components/TableUI'

import { ConfigType } from '@pages/ModulesPage/module.type'

import { notifyApiError } from '@utils/apiErrorNotifications'
import {
  deleteConfirmation,
  irreversibleDelete
} from '@utils/deleteConfirmation'
import { getModuleScrollState } from '@utils/moduleNavigation'

import useRole from '@hooks/useRole'

import configServiceApi from '@services/configService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './active-table-action-buttons.scss'
import { ActiveTableActionButtonsPropsType } from './active-table-action-buttons.type'

const ActiveTableActionButtons: FC<ActiveTableActionButtonsPropsType> = ({
  isActive,
  record,
  handleDeleteConfig,
  isDeleting,
  handleMarkConfigActive
}) => {
  const { hasPermission } = useRole()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [modal, contextHolder] = Modal.useModal()
  const { search } = useLocation()
  const [createUpdateConfig, { isLoading: isCopying }] =
    configServiceApi.useCreateUpdateConfigMutation()

  const canUpdateConfig = hasPermission(
    PermissionKeysType.module_configuration_edit
  )
  const canSetActiveVersion = hasPermission(
    PermissionKeysType.module_configuration_set_active
  )

  const navigateToAllVersion = () => {
    setMenuOpen(false)
    navigate(
      {
        pathname: `${routePaths.modules}/${record.moduleId}/configurations/${record.id}/all_versions`,
        search
      },
      { state: getModuleScrollState() }
    )
  }

  const copyConfig = () => {
    setMenuOpen(false)
    const newConfig = {
      name: `${record.name} (copy)`,
      moduleId: record.moduleId,
      id: '',
      version: 0,
      data: record.data,
      unsafe: !record.valid
    } as ConfigType
    createUpdateConfig(newConfig)
      .unwrap()
      .then(() => message.success('Конфиг успешно скопирован'))
      .catch((error) => notifyApiError(error, 'Не удалось скопировать конфиг'))
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'history',
      label: 'История версий',
      icon: <HistoryOutlined />,
      onClick: navigateToAllVersion
    },
    {
      key: 'copy',
      label: 'Создать копию',
      icon: <CopyOutlined />,
      disabled: isCopying,
      onClick: copyConfig
    },
    ...(!isActive
      ? [
          { type: 'divider' as const },
          {
            key: 'delete',
            label: 'Удалить конфигурацию',
            icon: <DeleteOutlined />,
            danger: true,
            disabled: isDeleting,
            onClick: () => {
              setMenuOpen(false)
              modal.confirm({
                title: `Удалить конфигурацию «${record.name || record.id}»?`,
                content: irreversibleDelete,
                ...deleteConfirmation,
                onOk: () => handleDeleteConfig(record)
              })
            }
          }
        ]
      : [])
  ]

  const renderAdditionalButtons = () => {
    return (
      <>
        {!isActive && canSetActiveVersion && (
          <Tooltip key="3" title="Сделать активной">
            <Popconfirm
              title="Сделать конфигурацию активной?"
              description={record.name}
              onConfirm={() => handleMarkConfigActive(record)}
              okText="Применить"
              cancelText="Отмена"
            >
              <TableActionButton
                className="active-configurations-table-actions-field__activate"
                aria-label="Сделать конфигурацию активной"
                icon={<CheckCircleOutlined />}
              />
            </Popconfirm>
          </Tooltip>
        )}
        <Dropdown
          open={menuOpen}
          onOpenChange={setMenuOpen}
          menu={{ items: menuItems }}
          trigger={['click']}
        >
          <TableActionButton
            aria-label="Другие действия конфигурации"
            icon={<EllipsisOutlined />}
          />
        </Dropdown>
      </>
    )
  }
  return (
    <div className="active-configurations-table-actions-field">
      {contextHolder}
      <TableActions>
        {canUpdateConfig && (
          <Tooltip title="Редактировать">
            <TableActionButton
              aria-label="Редактировать конфигурацию"
              onClick={() => {
                navigate(
                  {
                    pathname: `/${record.moduleId}/${routePaths.configEditor}/${record.id}`,
                    search
                  },
                  { state: { ...record, ...getModuleScrollState() } }
                )
              }}
              icon={<FormOutlined />}
            />
          </Tooltip>
        )}
        {renderAdditionalButtons()}
      </TableActions>
    </div>
  )
}

export default ActiveTableActionButtons
