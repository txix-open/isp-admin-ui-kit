import {
  AlertOutlined,
  DeleteOutlined,
  FormOutlined,
  EyeOutlined,
  HistoryOutlined,
  SwapOutlined,
  EllipsisOutlined,
  CopyOutlined
} from '@ant-design/icons'
import { Button, Dropdown, message, Popconfirm, Tooltip } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import CanEdit from '@components/CanEdit'

import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import configServiceApi from '@services/configService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { ActiveTableActionButtonsPropsType } from './active-table-action-buttons.type.ts'

import './active-table-action-buttons.scss'

const ActiveTableActionButtons: FC<ActiveTableActionButtonsPropsType> = ({
  isActive,
  record,
  handleShowCompareModal,
  handleShowConfig,
  handleDeleteConfig,
  handleMarkConfigActive
}) => {
  const navigate = useNavigate()
  const [createUpdateConfig] = configServiceApi.useCreateUpdateConfigMutation()

  const navigateToAllVersion = () => navigate(`${record.id}/all_versions`)

  const copyConfig = () => {
    const newConfig = {
      name: `${record.name} (copy)`,
      moduleId: record.moduleId,
      id: '',
      version: 0,
      data: record.data
    } as ConfigType
    createUpdateConfig(newConfig)
      .unwrap()
      .then(() => message.success('Конфиг успешно скопирован'))
      .catch(() => message.error('Не удалось скопировать конфиг'))
  }

  const renderDropDownNoActive = (record: any) => {
    return (
      <div className="dropdown">
        <Tooltip key="1" title="Сравнение версий">
          <Button
            onClick={() => handleShowCompareModal(record)}
            icon={<SwapOutlined />}
          />
        </Tooltip>
        <Tooltip key="2" title="Просмотр истории">
          <Button onClick={navigateToAllVersion} icon={<HistoryOutlined />} />
        </Tooltip>
        <CanEdit>
          <Tooltip key="4" title="Копировать конфиг">
            <Button icon={<CopyOutlined />} onClick={copyConfig} />
          </Tooltip>
          <Popconfirm
            title="Вы действительно хотите удалить выбранный конфиг?"
            onConfirm={() => handleDeleteConfig(record)}
          >
            <Tooltip key="3" title="Удалить конфиг">
              <Button danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </CanEdit>
      </div>
    )
  }

  const renderDropDownActive = (record: any) => {
    return (
      <div className="dropdown">
        <Tooltip key="1" title="Сравнение версий">
          <Button
            onClick={() => handleShowCompareModal(record)}
            icon={<SwapOutlined />}
          />
        </Tooltip>
        <Tooltip key="2" title="Просмотр истории">
          <Button onClick={navigateToAllVersion} icon={<HistoryOutlined />} />
        </Tooltip>
        <CanEdit>
          <Tooltip key="4" title="Копировать конфиг">
            <Button icon={<CopyOutlined />} onClick={copyConfig} />
          </Tooltip>
        </CanEdit>
      </div>
    )
  }

  const renderAdditionalButtons = () => {
    if (isActive) {
      return (
        <Dropdown dropdownRender={() => renderDropDownActive(record)}>
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>
      )
    }

    return (
      <>
        <CanEdit>
          <Tooltip key="3" title="Сделать активной">
            <Button
              onClick={() => handleMarkConfigActive(record)}
              icon={<AlertOutlined />}
            />
          </Tooltip>
        </CanEdit>
        <Dropdown dropdownRender={() => renderDropDownNoActive(record)}>
          <Button icon={<EllipsisOutlined />} />
        </Dropdown>
      </>
    )
  }
  return (
    <div className="active-configurations-table-actions-field">
      <Button.Group className="button_group">
        <Tooltip title="Просмотр">
          <Button
            onClick={() => handleShowConfig(record)}
            icon={<EyeOutlined />}
          />
        </Tooltip>
        <CanEdit>
          <Tooltip title="Редактировать">
            <Button
              onClick={() => {
                navigate(
                  `/${record.moduleId}/${routePaths.configEditor}/${record.id}`,
                  { state: record }
                )
              }}
              icon={<FormOutlined />}
            />
          </Tooltip>
        </CanEdit>
        {renderAdditionalButtons()}
      </Button.Group>
    </div>
  )
}

export default ActiveTableActionButtons
