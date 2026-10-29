import { PlusOutlined } from '@ant-design/icons'
import { Alert, Button } from 'antd'
import { memo, useEffect, useLayoutEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import ActiveConfigurationsTable from '@components/ActiveConfigurationsTable'
import ConfigSchemaModal from '@components/ConfigSchemaModal'
import ConfigurationPreviewModal from '@components/ConfigurationPreviewModal'
import SetConfigNameModal from '@components/SetConfigNameModal'

import { ConfigType } from '@pages/ModulesPage/module.type'

import useRole from '@hooks/useRole'

import configServiceApi from '@services/configService'
import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import { PermissionKeysType } from '@type/roles.type'

import './configurations.scss'

const Configurations = () => {
  const { data: modulesList = [], isLoading: isModulesLoading } =
    modulesServiceApi.useGetModulesQuery('modules')
  const { id: selectedItemId = '', configId = '' } = useParams()
  const {
    currentData: data,
    isLoading: isConfigsLoading,
    isFetching,
    isError,
    refetch
  } = configServiceApi.useGetConfigsByModuleIdQuery(selectedItemId, {
    skip: Boolean(configId)
  })

  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const location = useLocation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShowModalOpen, setisShowModalOpen] = useState(false)
  const [isSetNameModalOpen, setIsSetNameModalOpen] = useState(false)

  const [currentConfig, setCurrentConfig] = useState<ConfigType>(
    {} as ConfigType
  )
  const { activeConfigs = [], inactiveConfigs = [] } = data ?? {}
  const currentModule = useMemo(
    () => modulesList.find((module) => String(module.id) === selectedItemId),
    [selectedItemId, modulesList]
  )
  const isLoading =
    isModulesLoading || isConfigsLoading || (!data && isFetching)
  const hasData = Boolean(data)

  useLayoutEffect(() => {
    if (!isLoading && hasData && !configId) {
      const content = document.querySelector<HTMLElement>(
        '.modules-page__content'
      )
      const restoreScroll = () => {
        if (content) content.scrollTop = location.state?.moduleScrollTop ?? 0
      }
      restoreScroll()
      // Ant Design уточняет видимые колонки после первого рендера.
      const frame = requestAnimationFrame(restoreScroll)
      return () => cancelAnimationFrame(frame)
    }
  }, [location.key, isLoading, hasData, configId])

  useEffect(() => {
    if (!role) {
      navigate(routePaths.error)
    }
  }, [role])

  if (configId) {
    return <Outlet />
  }

  return (
    <section className="configurations">
      <ConfigurationPreviewModal
        config={currentConfig}
        open={isShowModalOpen}
        onClose={() => setisShowModalOpen(false)}
      />
      <SetConfigNameModal
        currentModule={currentModule}
        open={isSetNameModalOpen}
        onClose={() => setIsSetNameModalOpen(false)}
      />
      <ConfigSchemaModal
        schema={currentModule?.configSchema || {}}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      <div className="configurations__buttons">
        {hasPermission(PermissionKeysType.module_configuration_add) && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            className="configurations__buttons__new-config-brn"
            onClick={() => setIsSetNameModalOpen(true)}
          >
            Новая конфигурация
          </Button>
        )}
        <Button
          disabled={!currentModule?.configSchema}
          className="configurations____buttons__show-schema-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Текущая схема
        </Button>
        <span role="status" className="configurations__status">
          {isLoading
            ? 'Загрузка конфигураций…'
            : isFetching
              ? 'Обновление данных…'
              : ''}
        </span>
      </div>
      {isError && (
        <Alert
          type="error"
          showIcon
          title={
            hasData
              ? 'Не удалось обновить конфигурации'
              : 'Не удалось загрузить конфигурации'
          }
          description={
            hasData
              ? 'Показаны ранее загруженные данные.'
              : 'Повторите загрузку, чтобы увидеть конфигурации.'
          }
          action={
            <Button disabled={isFetching} onClick={() => refetch()}>
              Повторить
            </Button>
          }
        />
      )}
      <ActiveConfigurationsTable
        currentModule={currentModule}
        isActiveTable
        loading={isLoading}
        loadFailed={isError && !hasData}
        data={activeConfigs}
        handleShowConfig={(config) => {
          setCurrentConfig(config)
          setisShowModalOpen(true)
        }}
      />
      <ActiveConfigurationsTable
        loading={isLoading}
        loadFailed={isError && !hasData}
        currentModule={currentModule}
        data={inactiveConfigs}
        handleShowConfig={(config) => {
          setCurrentConfig(config)
          setisShowModalOpen(true)
        }}
      />
    </section>
  )
}

export default memo(Configurations)
