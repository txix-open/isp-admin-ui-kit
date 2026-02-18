import { ModalPropsType } from '@widgets/Modal/modal.type'

import { ApplicationsGroupType } from '@pages/ApplicationsPage/applications.type'

export type AppGroupModalType = Omit<ModalPropsType, 'onOk' | 'children'> & {
  appGroup?: ApplicationsGroupType
  onOk: (data: ApplicationsGroupType) => void
}
