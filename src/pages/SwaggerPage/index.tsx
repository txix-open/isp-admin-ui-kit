import { Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SwaggerUI from 'swagger-ui-react'

import modulesServiceApi from '@services/modulesService.ts'

import './swagger-page.scss'

import 'swagger-ui-react/swagger-ui.css'

const SwaggerPage = () => {
  const { id } = useParams()
  const { data: modules = [] } = modulesServiceApi.useGetModulesQuery('modules')
  const [swaggerPath, setSwaggerPath] = useState<string>('')

  useEffect(() => {
    if (modules.length && id) {
      const module = modules.find((m) => m.id === id)
      const swaggerEndpoint = module?.status
        ?.flatMap((s) => s.endpoints)
        ?.find((e) => e?.path?.includes('swagger'))

      if (swaggerEndpoint) {
        setSwaggerPath(swaggerEndpoint.path)
      }
    }
  }, [modules, id])

  const { data: swaggerSpec, isLoading } = modulesServiceApi.useGetSwaggerQuery(
    swaggerPath,
    {
      skip: !swaggerPath
    }
  )

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
        <SwaggerUI spec={swaggerSpec} />
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage
