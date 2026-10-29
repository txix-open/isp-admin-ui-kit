import { UseFormSetError } from 'react-hook-form'

import { ApplicationAppType } from '@pages/ApplicationsPage/applications.type'

export interface AppModalType {
  title: string
  open: boolean
  onClose: () => void
  app?: ApplicationAppType
  groupName: string
  onOk: (
    values: ApplicationAppType,
    setError: UseFormSetError<ApplicationAppType>
  ) => Promise<void>
}
