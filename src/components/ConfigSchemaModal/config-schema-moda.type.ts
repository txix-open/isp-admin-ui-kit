import { ModalPropsType } from '@widgets/Modal/modal.type'

import { JSONSchema } from '@pages/ModulesPage/module.type'

export interface ConfigSchemaModalPropsType extends Omit<
  ModalPropsType,
  'title' | 'children'
> {
  schema?: JSONSchema
}
