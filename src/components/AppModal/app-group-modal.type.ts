import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type.ts'

export type AppModalType = Omit<ModalPropsType, 'onOk' | 'children'> & {
  app?: ApplicationAppType
  onOk: (data: ApplicationAppType) => void
}
