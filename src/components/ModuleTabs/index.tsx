import { Tabs } from 'antd'
import { memo, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import ModuleTabContent from '@widgets/ModuleTabContent'

import { ModuleTabsPropsType } from '@components/ModuleTabs/module-tabs.type'

import { routePaths } from '@routes/routePaths'

const secondColumnItems = [
  { key: 'configurations', name: 'Конфигурации' },
  { key: 'connections', name: 'Подключения' }
] as const

const ModuleTabs = ({
  activeTab,
  currentModule,
  searchParams
}: ModuleTabsPropsType) => {
  const navigate = useNavigate()
  const location = useLocation()
  const contentRef = useRef<HTMLDivElement>(null)
  const { id: selectedItemId = '' } = useParams()
  useLayoutEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = location.state?.moduleScrollTop ?? 0
    }
  }, [location.key])

  const navigateToTab = (tabKey: string) => {
    const params = new URLSearchParams(searchParams)
    navigate({
      pathname: `${routePaths.modules}/${selectedItemId}/${tabKey}`,
      search: params.toString()
    })
  }

  return (
    <Tabs
      activeKey={activeTab}
      className="modules-page__tabs"
      onChange={navigateToTab}
      items={secondColumnItems.map(({ key, name }) => ({
        key,
        label: name,
        disabled: !currentModule,
        children:
          key === activeTab ? (
            <div
              className="modules-page__content"
              key={selectedItemId}
              ref={contentRef}
            >
              <ModuleTabContent
                selectedItemId={selectedItemId}
                currentModule={currentModule}
              />
            </div>
          ) : null
      }))}
    />
  )
}

export default memo(ModuleTabs)
