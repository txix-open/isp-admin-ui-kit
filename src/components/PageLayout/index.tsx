import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Result, Spin } from 'antd'
import type { ButtonProps } from 'antd'
import { forwardRef, ReactNode, useEffect, useRef } from 'react'
import type { ComponentRef } from 'react'

import './page-layout.scss'

export const PageBackButton = forwardRef<
  ComponentRef<typeof Button>,
  Omit<ButtonProps, 'type' | 'variant' | 'color'>
>(
  (
    {
      icon = <ArrowLeftOutlined aria-hidden />,
      children,
      className = '',
      ...props
    },
    ref
  ) => (
    <Button
      {...props}
      ref={ref}
      type="default"
      icon={icon}
      className={`page-back-button ${className}`}
    >
      <span className="page-back-button__label">{children}</span>
    </Button>
  )
)
PageBackButton.displayName = 'PageBackButton'

export interface PageHeaderProps {
  title: string
  description?: ReactNode
  context?: string
  actions?: ReactNode
  back?: ReactNode
  className?: string
  focusOnMount?: boolean
  level?: 1 | 2
}

export const PageHeader = ({
  title,
  description,
  context,
  actions,
  back,
  className = '',
  focusOnMount = false,
  level = 1
}: PageHeaderProps) => {
  const Heading = level === 1 ? 'h1' : 'h2'
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (focusOnMount) heading.current?.focus({ preventScroll: true })
  }, [focusOnMount])

  return (
    <header
      className={`page-header ${level === 1 ? 'page-header--screen' : ''} ${className}`}
    >
      <div className="page-header__inner">
        {back && <div className="page-header__back">{back}</div>}
        <div className="page-header__heading">
          {context && (
            <p className="page-header__context" title={context}>
              {context}
            </p>
          )}
          <Heading
            className="page-header__title"
            title={title}
            ref={heading}
            tabIndex={focusOnMount ? -1 : undefined}
          >
            {title}
          </Heading>
          {description && (
            <div
              className="page-header__description"
              title={typeof description === 'string' ? description : undefined}
            >
              {description}
            </div>
          )}
        </div>
        {actions && <div className="page-header__actions">{actions}</div>}
      </div>
    </header>
  )
}

export interface PageLayoutProps extends PageHeaderProps {
  children: ReactNode
  split?: boolean
}

const PageLayout = ({
  children,
  split = false,
  className = '',
  ...header
}: PageLayoutProps) => (
  <section
    className={`page-layout ${split ? 'page-layout--split' : ''} ${className}`}
  >
    <PageHeader {...header} />
    <div className="page-layout__body">{children}</div>
  </section>
)

export const PageLoading = ({ label = 'Загрузка…' }: { label?: string }) => (
  <div className="page-loading" role="status">
    <Spin />
    <span>{label}</span>
  </div>
)

export const PageAccessDenied = ({
  title,
  context,
  subTitle
}: Pick<PageHeaderProps, 'title' | 'context'> & { subTitle?: string }) => (
  <PageLayout title={title} context={context}>
    <Result status="403" title="Нет доступа к разделу" subTitle={subTitle} />
  </PageLayout>
)

export default PageLayout
