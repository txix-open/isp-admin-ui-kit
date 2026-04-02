import { Button, Spin, theme } from 'antd'
import { lazy, Suspense, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import { downloadFile } from '@utils/downloadFile'
import { toSafeFileName } from '@utils/toSafeFileName'

import modulesServiceApi from '@services/modulesService'
import swaggerServiceApi from '@services/swaggerService'

import './swagger-page.scss'

const SwaggerUI = lazy(() => import('swagger-ui-react'))

const { useToken } = theme

const SwaggerPage = () => {
  const { token } = useToken()

  const isDark = token.colorBgBase === '#141414'
  const { id } = useParams<{ id: string }>()

  const { data: modules = [] } = modulesServiceApi.useGetModulesQuery('modules')

  const [swaggerPath, setSwaggerPath] = useState<string>('')
  const [moduleName, setModuleName] = useState<string>('module')

  useEffect(() => {
    if (!modules.length || !id) {
      return
    }
    const module = modules.find((m) => m.id === id)

    if (!module) {
      return
    }
    setModuleName(module.name ?? 'module')

    const swaggerEndpoint = module.status
      ?.flatMap((s) => s.endpoints)
      ?.find((e) => e?.path?.includes('swagger'))

    if (swaggerEndpoint) {
      setSwaggerPath(`/${swaggerEndpoint.path}`)
    }
  }, [modules, id])

  useEffect(() => {
    const root = document.documentElement

    if (isDark) {
      root.classList.add('dark-mode')
    } else {
      root.classList.remove('dark-mode')
    }

    return () => {
      root.classList.remove('dark-mode')
    }
  }, [isDark])

  const { data: swaggerSpec, isLoading } = swaggerServiceApi.useGetSwaggerQuery(
    swaggerPath,
    {
      skip: !swaggerPath
    }
  )

  useEffect(() => {
    import('swagger-ui-react/swagger-ui.css')
  }, [])

  const handleDownload = () => {
    if (!swaggerSpec) {
      return
    }

    const safeName = toSafeFileName(moduleName)
    const json = JSON.stringify(swaggerSpec, null, 2)
    downloadFile({
      fileName: `swagger-${safeName}.json`,
      content: json,
      mimeType: 'application/json;charset=utf-8'
    })
  }

  if (isLoading) {
    return (
      <div className="swagger-page__loader">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="swagger-page">
      {swaggerSpec ? (
        <>
          <div className="swagger-page__toolbar">
            <Button type="primary" onClick={handleDownload}>
              Скачать Swagger
            </Button>
          </div>

          <div className="swagger-page__content">
            <Suspense fallback={<Spin />}>
              <SwaggerUI
                spec={swaggerSpec}
                docExpansion="list"
                defaultModelsExpandDepth={-1}
                displayOperationId={false}
                tryItOutEnabled={false}
                requestSnippetsEnabled={false}
              />
            </Suspense>
          </div>
        </>
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage
