import {
  ArrowLeftOutlined,
  DownloadOutlined,
  ReloadOutlined
} from '@ant-design/icons'
import { Alert, Button, Empty, Layout, Spin, Tag } from 'antd'
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ErrorBoundary, StoreBuilder } from 'redoc'

import PageLayout from '@components/PageLayout'

import { Context } from '@stores/index'

import { routePaths } from '@routes/routePaths'

import { useRedocEnhancements } from './useRedocEnhancements'

import RedocDocument from './RedocDocument'
import { DARK_OPTIONS, LIGHT_OPTIONS } from './redoc-options'
import './swagger-page.scss'
import type { RedocViewPropsType } from './swagger.type'
import { useSwaggerSpec } from './useSwaggerSpec'

const RedocView = memo(({ spec, isDark, containerRef }: RedocViewPropsType) => {
  const document = useMemo(() => ({ ...spec }), [spec])
  const [error, setError] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [rendering, setRendering] = useState(true)
  useEffect(() => {
    setError(false)
    setRendering(true)
  }, [spec, isDark])
  const onLoaded = useCallback((error?: Error) => {
    setError(Boolean(error))
    setRendering(false)
  }, [])
  return (
    <div className="swagger-page__content" aria-busy={rendering}>
      {error && (
        <Alert
          type="error"
          showIcon
          title="Не удалось отобразить спецификацию"
          description="Проверьте структуру OpenAPI или обновите документацию."
          action={
            <Button
              onClick={() => {
                setError(false)
                setRendering(true)
                setAttempt((value) => value + 1)
              }}
            >
              Повторить
            </Button>
          }
        />
      )}
      {!error && rendering && (
        <div className="swagger-page__rendering" role="status">
          <Spin size="small" />
          Подготовка документации…
        </div>
      )}
      {!error && (
        <ErrorBoundary>
          <StoreBuilder
            key={`${isDark}-${attempt}`}
            spec={document}
            options={isDark ? DARK_OPTIONS : LIGHT_OPTIONS}
            onLoaded={onLoaded}
          >
            {({ loading, store }) =>
              !loading && store ? (
                <RedocDocument store={store} containerRef={containerRef} />
              ) : null
            }
          </StoreBuilder>
        </ErrorBoundary>
      )}
    </div>
  )
})

const methods = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'options',
  'head',
  'trace'
])

const SwaggerPage = () => {
  const { changeTheme: isDark } = useContext(Context)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { search, state } = useLocation()
  const pageRef = useRef<HTMLDivElement>(null)
  const {
    parsedSpec,
    module,
    isLoading,
    isFetching,
    isError,
    errorTitle,
    errorDescription,
    emptyDescription,
    refetch
  } = useSwaggerSpec(id)
  useRedocEnhancements(pageRef, parsedSpec, isDark)
  const operationCount = Object.values(parsedSpec?.paths ?? {}).reduce(
    (count, path) =>
      count +
      (path && typeof path === 'object'
        ? Object.keys(path).filter((key) => methods.has(key.toLowerCase()))
            .length
        : 0),
    0
  )

  const downloadSpec = () => {
    if (!parsedSpec) return
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(parsedSpec, null, 2)], {
        type: 'application/json'
      })
    )
    const link = document.createElement('a')
    link.href = url
    link.download = `${(module?.name || id || 'module').replace(/[\\/:*?"<>|]/g, '-')}.openapi.json`
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Layout className="swagger-shell">
      <PageLayout
        title={module?.name || 'API модуля'}
        context={module?.name ? 'API модуля' : undefined}
        description={
          parsedSpec && (
            <span className="swagger-page__meta">
              {parsedSpec.info?.version && (
                <Tag>v{parsedSpec.info.version}</Tag>
              )}
              {(parsedSpec.openapi || parsedSpec.swagger) && (
                <span>
                  {parsedSpec.openapi ? 'OpenAPI' : 'Swagger'}{' '}
                  {parsedSpec.openapi || parsedSpec.swagger}
                </span>
              )}
              {operationCount > 0 && <span>Методов: {operationCount}</span>}
              {isFetching && <span role="status">Обновление…</span>}
            </span>
          )
        }
        className="swagger-screen"
        split
        back={
          <Button
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
            К модулю
          </Button>
        }
        actions={
          <>
            <Button
              icon={<ReloadOutlined />}
              loading={isFetching}
              onClick={refetch}
            >
              Обновить
            </Button>
            <Button
              icon={<DownloadOutlined />}
              disabled={!parsedSpec}
              onClick={downloadSpec}
            >
              Скачать JSON
            </Button>
          </>
        }
      >
        {isError && (
          <Alert
            type="error"
            showIcon
            title={errorTitle}
            description={errorDescription}
            action={
              <Button disabled={isFetching} onClick={refetch}>
                Повторить
              </Button>
            }
          />
        )}
        <div
          className={`swagger-page workspace-card ${isDark ? 'swagger-page--dark' : ''}`}
          ref={pageRef}
          role="region"
          aria-label="Документация API"
          tabIndex={0}
        >
          {isLoading ? (
            <div className="swagger-page__loader" role="status">
              <Spin size="large" />
              <span>Загрузка документации…</span>
            </div>
          ) : parsedSpec ? (
            <RedocView
              spec={parsedSpec}
              isDark={isDark}
              containerRef={pageRef}
            />
          ) : (
            <div className="swagger-page__no-data">
              <Empty
                description={
                  isError ? 'Документация недоступна' : emptyDescription
                }
              />
            </div>
          )}
        </div>
      </PageLayout>
    </Layout>
  )
}

export default SwaggerPage
