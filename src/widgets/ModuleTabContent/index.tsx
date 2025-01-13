import { Layout } from 'isp-ui-kit'
import { memo } from 'react'
import { Outlet } from 'react-router-dom'

import { ModuleTabContentPropsType } from '@widgets/ModuleTabContent/module-tab-content.type.ts'

const { EmptyData, NoData } = Layout

const ModuleTabContent = ({
  selectedItemId,
  currentModule
}: ModuleTabContentPropsType) => {
  if (!selectedItemId) {
    return <EmptyData />
  }

  if (!currentModule) {
    return <NoData />
  }

  return <Outlet />
}

export default memo(ModuleTabContent)
