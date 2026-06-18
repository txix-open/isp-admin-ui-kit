export interface ModuleNodeDataType {
  id: string
  name: string
  incomingCount: number
  outgoingCount: number
  isConnected: boolean
  isDimmed: boolean
  isSelected: boolean
  onSelect?: (id: string) => void
}
