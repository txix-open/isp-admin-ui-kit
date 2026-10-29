import { ReactNode, useEffect, useRef } from 'react'

import './page-layout.scss'

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
    <header className={`page-header ${className}`}>
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

export default PageLayout
