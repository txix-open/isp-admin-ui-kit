import { Spin } from 'antd'
import { memo, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { RedocStandalone } from 'redoc'

import { Context } from '@stores/index'

import { useRedocEnhancements } from './useRedocEnhancements'

import { DARK_OPTIONS, LIGHT_OPTIONS } from './redoc-options'
import './swagger-page.scss'
import type { RedocViewPropsType } from './swagger.type'
import { useSwaggerSpec } from './useSwaggerSpec'

const RedocView = memo(({ spec, isDark }: RedocViewPropsType) => (
  <RedocStandalone
    key={isDark ? 'redoc-dark' : 'redoc-light'}
    spec={spec}
    options={isDark ? DARK_OPTIONS : LIGHT_OPTIONS}
  />
))

const SwaggerPage = () => {
  const { changeTheme: isDark } = useContext(Context)

  const { id } = useParams<{ id: string }>()
  const pageRef = useRef<HTMLDivElement>(null)
  const { parsedSpec, isLoading } = useSwaggerSpec(id)

  useRedocEnhancements(pageRef, parsedSpec, isDark)

  if (isLoading) {
    return (
      <div className="swagger-page__loader">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div
      className={`swagger-page ${isDark ? 'swagger-page--dark' : ''}`}
      ref={pageRef}
    >
      {parsedSpec ? (
        <div className="swagger-page__content">
          <RedocView spec={parsedSpec} isDark={isDark} />
        </div>
      ) : (
        <div className="swagger-page__no-data">Нет данных Swagger</div>
      )}
    </div>
  )
}

export default SwaggerPage
