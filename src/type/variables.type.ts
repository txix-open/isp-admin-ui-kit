interface ContainsVariableConfigType {
  id: string
  name: string
  moduleId: string
}

interface VariableType {
  description: string
  name: string
  type: 'SECRET' | 'TEXT'
  value: string
  containsInConfigs: ContainsVariableConfigType[]
  createdAt: string
  updatedAt: string
}

interface NewVariableType
  extends Omit<VariableType, 'containsInConfigs' | 'createdAt' | 'updatedAt'> {}

interface UpdateVariableType extends Omit<NewVariableType, 'type'> {}
