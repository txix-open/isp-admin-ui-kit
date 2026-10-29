import {
  ArrowLeftOutlined,
  ReloadOutlined,
  CloudServerOutlined,
  LinkOutlined
} from '@ant-design/icons'
import { Button, message, Row, Col, Spin, theme } from 'antd'
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

import { FlowDiagram } from '@components/FlowDiagram/FlowDiagram'
import { PageHeader } from '@components/PageLayout'
import { StatsCard } from '@components/StatsCard/StatsCard'

import { notifyApiError } from '@utils/apiErrorNotifications'

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
      <Spin size="large" description="Загрузка диаграммы связей..." />
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
    <PageHeader
      title="Карта связей модулей"
      back={
        <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
          К модулям
        </Button>
      }
      actions={
        <Button
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          loading={isRefreshing}
        >
          Обновить
        </Button>
      }
    />
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

  const handleRefresh = useCallback(
    () =>
      refetch()
        .unwrap()
        .then(() => {
          message.success('Данные успешно обновлены')
        })
        .catch((error) => {
          notifyApiError(error, 'Ошибка при обновлении данных')
        }),
    [refetch]
  )

  const handleBack = () => navigate(routePaths.modules)

  if (isLoading) {
    return (
      <div className="modules-relations-diagram">
        <Header onBack={handleBack} onRefresh={handleRefresh} isRefreshing />
        <div className="modules-relations-diagram__body">
          <Loader />
        </div>
      </div>
    )
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
        <div className="modules-relations-diagram__body">
          <div className="modules-relations-diagram__error">
            <h3>Ошибка загрузки данных</h3>
            <p>
              Не удалось загрузить список модулей. Попробуйте обновить позже.
            </p>
            <Button type="primary" onClick={handleRefresh} loading={isFetching}>
              Повторить
            </Button>
          </div>
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

      <div className="modules-relations-diagram__body">
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
    </div>
  )
}

export default ModuleRelationsPage
