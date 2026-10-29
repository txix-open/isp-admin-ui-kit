import { Empty } from 'antd'
import { memo } from 'react'
import { Outlet } from 'react-router-dom'

import { ModuleTabContentPropsType } from '@widgets/ModuleTabContent/module-tab-content.type'

const ModuleTabContent = ({
  selectedItemId,
  currentModule
}: ModuleTabContentPropsType) => {
  if (!selectedItemId) {
    return <Empty description="Выберите модуль слева" />
  }

  if (!currentModule) {
    return <Empty description="Модуль не найден или больше недоступен" />
  }

  return <Outlet />
}

export default memo(ModuleTabContent)
