import { Button, Spin } from 'antd'
import { memo, useEffect, useMemo, useState } from 'react'
import { Outlet, useNavigate, useParams } from 'react-router-dom'

import ActiveConfigurationsTable from '@components/ActiveConfigurationsTable'
import CompareVersionModal from '@components/CompareVersionModal'
import ConfigSchemaModal from '@components/ConfigSchemaModal'
import ConfigurationPreviewModal from '@components/ConfigurationPreviewModal'

import { ConfigType } from '@pages/ModulesPage/module.type.ts'

import useRole from '@hooks/useRole.tsx'

import configServiceApi from '@services/configService.ts'
import modulesServiceApi from '@services/modulesService.ts'

import { routePaths } from '@routes/routePaths.ts'

import { PermissionKeysType } from '@type/roles.type.ts'

import './configurations.scss'

const Configurations = () => {
  const {
    data: modulesList = [],
    isLoading: isModulesLoading,
    isError: isModulesError
  } = modulesServiceApi.useGetModulesQuery('configurations')
  const { id: selectedItemId = '', configId = '' } = useParams()
  const {
    data = { originalResponse: [], activeConfigs: [], inactiveConfigs: [] },
    isLoading: isConfigsLoading,
    isError: isConfigsError
  } = configServiceApi.useGetConfigsByModuleIdQuery(selectedItemId)

  const { role, hasPermission } = useRole()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isShowModalOpen, setisShowModalOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)

  const [currentConfig, setCurrentConfig] = useState<ConfigType>(
    {} as ConfigType
  )
  const { activeConfigs, inactiveConfigs } = data
  const currentModule = useMemo(
    () => modulesList.find((module) => module.id === selectedItemId),
    [selectedItemId, modulesList]
  )
  const isLoading = isModulesLoading || isConfigsLoading
  const isError = isModulesError || isConfigsError
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
      <ConfigSchemaModal
        schema={currentModule?.configSchema || {}}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
      {isCompareModalOpen && (
        <CompareVersionModal
          currentConfigId={currentConfig.id}
          config={currentConfig}
          open={isCompareModalOpen}
          onClose={() => setIsCompareModalOpen(false)}
        />
      )}
      <div className="configurations__buttons">
        <Button
          disabled={!currentModule?.configSchema}
          className="configurations____buttons__show-schema-btn"
          onClick={() => setIsModalOpen(true)}
        >
          Текущая схема
        </Button>
      </div>
      <ActiveConfigurationsTable
        currentModule={currentModule}
        isActiveTable
        data={isError ? [] : activeConfigs}
        handleShowConfig={(config) => {
          setCurrentConfig(config)
          setisShowModalOpen(true)
        }}
        handleShowCompareModal={(config) => {
          setCurrentConfig(config)
          setIsCompareModalOpen(true)
        }}
      />
      <ActiveConfigurationsTable
        currentModule={currentModule}
        data={isError ? [] : inactiveConfigs}
        handleShowConfig={(config) => {
          setCurrentConfig(config)
          setisShowModalOpen(true)
        }}
        handleShowCompareModal={(config) => {
          setCurrentConfig(config)
          setIsCompareModalOpen(true)
        }}
      />
    </section>
  )
}

export default memo(Configurations)
