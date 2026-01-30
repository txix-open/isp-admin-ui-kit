import { Button, Spin } from 'antd'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import SwaggerUI from 'swagger-ui-react'

import { base64ToUtf8 } from '@utils/base64ToJson.ts'
import { downloadFile } from '@utils/downloadFile.ts'
import { toSafeFileName } from '@utils/toSafeFileName.ts'

import modulesServiceApi from '@services/modulesService.ts'
import swaggerServiceApi from '@services/swaggerService.ts'

import './swagger-page.scss'

import 'swagger-ui-react/swagger-ui.css'

const SwaggerPage = () => {
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

  const { data: swaggerSpec, isLoading } = swaggerServiceApi.useGetSwaggerQuery(
    swaggerPath,
    {
      skip: !swaggerPath
    }
  )

  const swaggerSpecText = swaggerSpec ? base64ToUtf8(swaggerSpec) : ''

  const handleDownload = () => {
    if (!swaggerSpecText) {
      return
    }

    const safeName = toSafeFileName(moduleName)

    downloadFile({
      fileName: `swagger-${safeName}.yml`,
      content: swaggerSpecText,
      mimeType: 'application/yaml;charset=utf-8'
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
            <SwaggerUI spec={swaggerSpecText} />
          </div>
        </>
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage
