import { Tabs } from 'antd'
import { memo, useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { MODULES_TAB_KEYS } from '@constants/modules'

import ModuleTabContent from '@widgets/ModuleTabContent'

import { ModuleTabsPropsType } from '@components/ModuleTabs/module-tabs.type'

const secondColumnItems = [
  { key: 'configurations', name: 'Конфигурации' },
  { key: 'connections', name: 'Подключения' },
  { key: 'swagger', name: 'Swagger' }
] as const

const ModuleTabs = ({
  activeTab,
  setActiveTab,
  currentModule,
  searchParams
}: ModuleTabsPropsType) => {
  const navigate = useNavigate()
  const { id: selectedItemId = '' } = useParams()

  const hasSwagger = useMemo(
    () =>
      currentModule?.status?.some((status) =>
        status.endpoints?.some((e) => e.path.includes('swagger'))
      ),
    [currentModule]
  )

  const resolvedActiveTab = useMemo(() => {
    return activeTab === MODULES_TAB_KEYS.swagger && !hasSwagger
      ? 'configurations'
      : activeTab
  }, [activeTab, hasSwagger])

  const navigateToTab = (tabKey: string) => {
    const params = new URLSearchParams(searchParams)
    navigate(
      {
        pathname: `${selectedItemId}/${tabKey}`,
        search: params.toString()
      },
      { replace: true }
    )
  }

  useEffect(() => {
    if (resolvedActiveTab !== activeTab) {
      setActiveTab(resolvedActiveTab)
      navigateToTab(resolvedActiveTab)
    }
  }, [resolvedActiveTab])

  const items = useMemo(
    () =>
      secondColumnItems.filter(({ key }) => key !== 'swagger' || hasSwagger),
    [hasSwagger]
  )

  return (
    <Tabs
      activeKey={resolvedActiveTab}
      className="modules-page__tabs"
      onChange={(key) => {
        setActiveTab(key)
        navigateToTab(key)
      }}
      items={items.map(({ key, name }) => ({
        key,
        label: name,
        disabled: !selectedItemId,
        children: (
          <div className="modules-page__content">
            <ModuleTabContent
              selectedItemId={selectedItemId}
              currentModule={currentModule}
            />
          </div>
        )
      }))}
    />
  )
}

export default memo(ModuleTabs)
