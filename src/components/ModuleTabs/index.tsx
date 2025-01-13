import { Tabs } from 'antd'
import { memo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import ModuleTabContent from '@widgets/ModuleTabContent'

import { ModuleTabsPropsType } from '@components/ModuleTabs/module-tabs.type.ts'

const secondColumnItems = [
  {
    key: 'configurations',
    name: 'Конфигурации'
  },
  { key: 'connections', name: 'Подключения' }
]

const ModuleTabs = ({
  activeTab,
  setActiveTab,
  currentModule
}: ModuleTabsPropsType) => {
  const navigate = useNavigate()
  const { id: selectedItemId = '' } = useParams()
  return (
    <Tabs
      activeKey={activeTab}
      onChange={(activeKey) => {
        setActiveTab(activeKey)
        const path = `${selectedItemId}/${activeKey}`
        navigate(path)
      }}
      className="modules-page__tabs"
      items={secondColumnItems.map((item) => {
        return {
          disabled: selectedItemId === '',
          label: item.name,
          key: item.key,
          children: (
            <div className="modules-page__content">
              <ModuleTabContent
                selectedItemId={selectedItemId}
                currentModule={currentModule}
              />
            </div>
          )
        }
      })}
    />
  )
}

export default memo(ModuleTabs)
