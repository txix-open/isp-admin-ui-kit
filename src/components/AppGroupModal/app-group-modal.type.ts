import {
  ApplicationsGroupType,
  NewApplicationsGroupType
} from '@pages/ApplicationsPage/applications.type'

export interface AppGroupModalType {
  title: string
  open: boolean
  onClose: () => void
  appGroup?: ApplicationsGroupType
  onOk: (values: NewApplicationsGroupType) => Promise<void>
}
