import { Spin } from 'antd'
import { memo, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { RedocStandalone } from 'redoc'

import { Context } from '@stores/index'

import { DARK_OPTIONS, LIGHT_OPTIONS } from './redoc-options'
import './swagger-page.scss'
import type { RedocViewPropsType } from './swagger.type'
import { useRedocEnhancements } from './useRedocEnhancements'
import { useSwaggerSpec } from './useSwaggerSpec'

const RedocView = memo(({ spec, isDark }: RedocViewPropsType) => (
  <RedocStandalone
    spec={spec}
    options={isDark ? DARK_OPTIONS : LIGHT_OPTIONS}
  />
))

const SwaggerPage = () => {
  const { changeTheme: isDark } = useContext(Context)

  const { id } = useParams<{ id: string }>()
  const contentRef = useRef<HTMLDivElement>(null)
  const { parsedSpec, isLoading } = useSwaggerSpec(id)

  useRedocEnhancements(contentRef, parsedSpec, isDark)

  if (isLoading) {
    return (
      <div className="swagger-page__loader">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className={`swagger-page ${isDark ? 'swagger-page--dark' : ''}`}>
      {parsedSpec ? (
        <div className="swagger-page__content" ref={contentRef}>
          <RedocView spec={parsedSpec} isDark={isDark} />
        </div>
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage
