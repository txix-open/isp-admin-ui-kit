import { Spin, theme } from 'antd'
import { lazy, Suspense, useEffect, useState, useMemo } from 'react'
import { useParams, useResolvedPath } from 'react-router-dom'
import { useThemeStore } from '@stoplight/mosaic'

import modulesServiceApi from '@services/modulesService'
import swaggerServiceApi from '@services/swaggerService'

import './swagger-page.scss'

const API = lazy(() => import('@stoplight/elements').then((mod) => ({ default: mod.API })))

const { useToken } = theme

const SwaggerPage = () => {
  const { token } = useToken()
  const { pathname: basePath } = useResolvedPath('.')

  const isDark = token.colorBgBase === '#141414'
  const setThemeMode = useThemeStore((s) => s.setMode)

  const { id } = useParams<{ id: string }>()

  const { data: modules = [] } = modulesServiceApi.useGetModulesQuery('modules')

  const [swaggerPath, setSwaggerPath] = useState<string>('')

  const { data: swaggerSpec, isLoading } = swaggerServiceApi.useGetSwaggerQuery(
    swaggerPath,
    {
      skip: !swaggerPath
    }
  )

  const apiDescriptionDocument = useMemo(() => {
    if (!swaggerSpec) {
      return null
    }

    if (typeof swaggerSpec === 'string') {
      try {
        const parsedSpec = JSON.parse(swaggerSpec)
        return JSON.parse(JSON.stringify(parsedSpec))
      } catch {
        return swaggerSpec
      }
    }

    return JSON.parse(JSON.stringify(swaggerSpec))
  }, [swaggerSpec])

  useEffect(() => {
    import('@stoplight/elements/styles.min.css')
  }, [])

  useEffect(() => {
    if (!modules.length || !id) {
      return
    }
    const module = modules.find((m) => m.id === id)

    if (!module) {
      return
    }

    const swaggerEndpoint = module.status
      ?.flatMap((s) => s.endpoints)
      ?.find((e) => e?.path?.includes('swagger'))

    if (swaggerEndpoint) {
      setSwaggerPath(`/${swaggerEndpoint.path}`)
    }
  }, [modules, id])

  useEffect(() => {
    setThemeMode(isDark ? 'dark' : 'light')
  }, [isDark, setThemeMode])

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
        <div className="swagger-page__content">
          <Suspense fallback={<Spin />}>
            <API
              apiDescriptionDocument={apiDescriptionDocument}
              hideTryIt={true}
              basePath={basePath}
              layout="responsive"
            />
          </Suspense>
        </div>
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage