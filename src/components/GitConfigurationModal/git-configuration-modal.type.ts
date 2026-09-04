import { ModalPropsType } from '@widgets/Modal/modal.type'

import {
  CredentialsInfoType,
  CredentialsType
} from '@type/gitConfiguration.type'

export type GitConfigurationModalType = Omit<
  ModalPropsType,
  'onOk' | 'children'
> & {
  credentials?: CredentialsInfoType
  onOk: (data: CredentialsType) => void
}
