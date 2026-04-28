import {
  ArrowLeftOutlined,
  ReloadOutlined,
  ApartmentOutlined,
  CloudServerOutlined,
  LinkOutlined
} from '@ant-design/icons'
import { Button, message, Row, Col, Spin, theme } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { FlowDiagram } from '@components/FlowDiagram/FlowDiagram'
import { StatsCard } from '@components/StatsCard/StatsCard'

import { useModuleRelations } from '@hooks/useModuleRelations'

import modulesServiceApi from '@services/modulesService'

import { routePaths } from '@routes/routePaths'

import './modules-relations-diagram.scss'

const Loader = () => {
  const { token } = theme.useToken()
  return (
    <div
      className="modules-relations-diagram__loading"
      style={{ background: token.colorBgContainer }}
    >
      <Spin size="large" tip="Загрузка диаграммы связей..." />
    </div>
  )
}

const Header = ({
  onBack,
  onRefresh,
  isRefreshing
}: {
  onBack: () => void
  onRefresh: () => void
  isRefreshing: boolean
}) => {
  return (
    <div className="modules-relations-diagram__header">
      <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
        Назад к модулям
      </Button>
      <h2 className="modules-relations-diagram__title">
        <ApartmentOutlined /> Карта связей модулей
      </h2>
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
        loading={isRefreshing}
      >
        Обновить
      </Button>
    </div>
  )
}

const Legend = () => {
  const { token } = theme.useToken()
  return (
    <div
      className="modules-relations-diagram__legend"
      style={{ background: token.colorBgLayout }}
    >
      <span className="modules-relations-diagram__legend-title">Легенда:</span>
      <div className="modules-relations-diagram__legend-item">
        <div className="modules-relations-diagram__legend-line" />
        <span>Зависимость</span>
      </div>
    </div>
  )
}

const ModuleRelationsPage = () => {
  const navigate = useNavigate()
  const { token } = theme.useToken()
  const {
    data: modules = [],
    isLoading,
    isFetching,
    isError,
    refetch
  } = modulesServiceApi.useGetRequiredModulesQuery('requiredModules')
  const relations = useModuleRelations(modules)

  const handleRefresh = useCallback(async () => {
    try {
      await refetch().unwrap()
      message.success('Данные успешно обновлены')
    } catch {
      message.error('Ошибка при обновлении данных')
    }
  }, [refetch])

  const handleBack = () => navigate(routePaths.modules)

  if (isLoading) {
    return <Loader />
  }

  if (isError) {
    return (
      <div
        className="modules-relations-diagram"
        style={{ background: token.colorBgContainer }}
      >
        <Header
          onBack={handleBack}
          onRefresh={handleRefresh}
          isRefreshing={isFetching}
        />
        <div className="modules-relations-diagram__error">
          <h3>Ошибка загрузки данных</h3>
          <p>Не удалось загрузить список модулей. Попробуйте обновить позже.</p>
          <Button type="primary" onClick={handleRefresh} loading={isFetching}>
            Повторить
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="modules-relations-diagram"
      style={{ background: token.colorBgContainer }}
    >
      <Header
        onBack={handleBack}
        onRefresh={handleRefresh}
        isRefreshing={isFetching}
      />

      <Row gutter={16} className="modules-relations-diagram__stats">
        <Col span={12}>
          <StatsCard
            icon={
              <CloudServerOutlined className="modules-relations-diagram__stat-card-icon" />
            }
            label="Всего модулей"
            value={modules.length}
          />
        </Col>
        <Col span={12}>
          <StatsCard
            icon={
              <LinkOutlined className="modules-relations-diagram__stat-card-icon" />
            }
            label="Всего связей"
            value={relations.length}
          />
        </Col>
      </Row>

      <Legend />

      <FlowDiagram
        modules={modules}
        relations={relations}
        isLoading={isFetching}
      />
    </div>
  )
}

export default ModuleRelationsPage
