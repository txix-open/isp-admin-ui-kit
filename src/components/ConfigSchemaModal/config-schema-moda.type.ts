import { ModalPropsType } from '@widgets/Modal/modal.type.ts'

import { JSONSchema } from '@pages/ModulesPage/module.type.ts'

export interface ConfigSchemaModalPropsType
  extends Omit<ModalPropsType, 'title' | 'children'> {
  schema?: JSONSchema
}
