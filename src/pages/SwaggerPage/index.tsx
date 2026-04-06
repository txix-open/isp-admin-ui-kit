import { Spin } from 'antd'
import {
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import { useParams } from 'react-router-dom'
import { RedocStandalone } from 'redoc'

import modulesServiceApi from '@services/modulesService'
import swaggerServiceApi from '@services/swaggerService'

import { Context } from '@stores/index'

import { DARK_OPTIONS, LIGHT_OPTIONS } from './redoc-options'
import './swagger-page.scss'
import type { RedocViewPropsType } from './swagger.type'

const RedocView = memo(({ spec, isDark }: RedocViewPropsType) => (
  <RedocStandalone
    spec={spec}
    options={isDark ? DARK_OPTIONS : LIGHT_OPTIONS}
  />
))

const SwaggerPage = () => {
  const { changeTheme: isDark } = useContext(Context)

  const { id } = useParams<{ id: string }>()
  const { data: modules = [] } = modulesServiceApi.useGetModulesQuery('modules')

  const [swaggerPath, setSwaggerPath] = useState('')
  const contentRef = useRef<HTMLDivElement>(null)

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

  const { data: swaggerSpec, isLoading } = swaggerServiceApi.useGetSwaggerQuery(
    swaggerPath,
    {
      skip: !swaggerPath
    }
  )

  const parsedSpec = useMemo(() => {
    if (!swaggerSpec) {
      return null
    }

    try {
      return typeof swaggerSpec === 'string'
        ? JSON.parse(swaggerSpec)
        : swaggerSpec
    } catch {
      return null
    }
  }, [swaggerSpec])

  const scrollToHash = useCallback(() => {
    const container = contentRef.current
    const hash = decodeURIComponent(window.location.hash.slice(1))

    if (!container || !hash) {
      return
    }
    const el = container.querySelector(`[data-section-id="${hash}"]`)

    if (!el) {
      return
    }

    const top =
      el.getBoundingClientRect().top -
      container.getBoundingClientRect().top +
      container.scrollTop

    container.scrollTo({ top, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    if (!contentRef.current || !parsedSpec) {
      return
    }

    const orig = history.pushState.bind(history)
    history.pushState = (...args) => {
      orig(...args)
      scrollToHash()
    }

    return () => {
      history.pushState = orig
    }
  }, [parsedSpec, scrollToHash])

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
