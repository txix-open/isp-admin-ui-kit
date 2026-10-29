import { ExportOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Button, Tag, Tooltip, Typography } from 'antd'
import { compareVersions, validate } from 'compare-versions'
import { useHref } from 'react-router-dom'

import { routePaths } from '@routes/routePaths'

import { ModuleType } from './module.type'

export const getModuleVersions = (module: ModuleType) => [
  ...new Set(
    (module.status ?? []).map((instance) => instance.version).filter(Boolean)
  )
]

export const ModuleVersion = ({ module }: { module: ModuleType }) => {
  const versions = getModuleVersions(module)
  if (!versions.length) return null
  const sorted = versions.every(validate)
    ? [...versions].sort(compareVersions)
    : versions
  const latestVersion = sorted[sorted.length - 1]
  return versions.length === 1 ? (
    <Tag>{versions[0]}</Tag>
  ) : (
    <Tooltip title={`Версии экземпляров: ${versions.join(', ')}`}>
      <Tag color="warning" icon={<ExclamationCircleOutlined />}>
        {latestVersion}
      </Tag>
    </Tooltip>
  )
}

const ModuleSummary = ({
  module,
  search
}: {
  module: ModuleType
  search: string
}) => {
  const apiHref = useHref({
    pathname: `${routePaths.modules}/${module.id}/${routePaths.swagger}`,
    search
  })
  const hasSwagger = module.status?.some((instance) =>
    instance.endpoints?.some((endpoint) => endpoint.path.includes('swagger'))
  )
  const moduleId = String(module.id)
  const shortId =
    moduleId.length > 18
      ? `${moduleId.slice(0, 8)}…${moduleId.slice(-6)}`
      : moduleId
  return (
    <section
      className="modules-page__module-summary"
      aria-label="Выбранный модуль"
    >
      <div className="modules-page__module-heading">
        <h2 title={module.name}>{module.name}</h2>
        <div className="modules-page__module-meta">
          <Tooltip title={`ID модуля: ${moduleId}`}>
            <Typography.Text
              className="modules-page__module-id"
              copyable={{
                text: moduleId,
                tooltips: ['Скопировать ID', 'ID скопирован']
              }}
            >
              ID: {shortId}
            </Typography.Text>
          </Tooltip>
          <span>Экземпляры: {module.status?.length ?? 0}</span>
          <ModuleVersion module={module} />
        </div>
      </div>
      {hasSwagger && (
        <Button
          href={apiHref}
          target="_blank"
          rel="noopener noreferrer"
          icon={<ExportOutlined />}
          aria-label="API (новая вкладка)"
        >
          API
        </Button>
      )}
    </section>
  )
}

export default ModuleSummary
