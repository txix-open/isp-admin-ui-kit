import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

import { ApplicationsGroupType } from '@pages/ApplicationsPage/applications.type.ts'

export type AppGroupModalType = Omit<ModalPropsType, 'onOk' | 'children'> & {
  appGroup?: ApplicationsGroupType
  onOk: (data: ApplicationsGroupType) => void
}
