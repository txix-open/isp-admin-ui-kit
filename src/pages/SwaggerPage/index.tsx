import { Button, Spin } from 'antd'
import { memo, useContext, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { RedocStandalone } from 'redoc'

import PageLayout from '@components/PageLayout'

import { Context } from '@stores/index'

import { routePaths } from '@routes/routePaths'

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
  const navigate = useNavigate()
  const pageRef = useRef<HTMLDivElement>(null)
  const { parsedSpec, isLoading } = useSwaggerSpec(id)

  useRedocEnhancements(pageRef, parsedSpec, isDark)

  return (
    <PageLayout
      title="API модуля"
      className="swagger-screen"
      split
      back={
        <Button
          onClick={() => navigate(`${routePaths.modules}/${id}/configurations`)}
        >
          К модулю
        </Button>
      }
    >
      <div
        className={`swagger-page ${isDark ? 'swagger-page--dark' : ''}`}
        ref={pageRef}
      >
        {isLoading ? (
          <div className="swagger-page__loader">
            <Spin size="large" />
          </div>
        ) : parsedSpec ? (
          <div className="swagger-page__content">
            <RedocView spec={parsedSpec} isDark={isDark} />
          </div>
        ) : (
          <div className="swagger-page__no-data">Нет данных Swagger</div>
        )}
      </div>
    </PageLayout>
  )
}

export default SwaggerPage
