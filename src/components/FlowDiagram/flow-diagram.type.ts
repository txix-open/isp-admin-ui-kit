import {
  type Edge,
  type Node,
  type NodeMouseHandler,
  type OnEdgesChange,
  type OnNodesChange
} from 'reactflow'

import { type ModuleNodeDataType } from '@components/ModuleNode/module-node.type'

import { type ModuleType } from '@pages/ModulesPage/module.type'

import { type ModuleRelation } from '@type/ModuleRelation.type'

export interface FlowDiagramPropsType {
  modules: ModuleType[]
  relations: ModuleRelation[]
  isLoading: boolean
}

export interface SelectedRelationsType {
  incoming: ModuleRelation[]
  outgoing: ModuleRelation[]
}

export interface RelationModuleItemType {
  id: string
  key: string
  name: string
  onSelect: () => void
}

export interface FlowDiagramStateType {
  edges: Edge[]
  handleClearSelection: () => void
  handleFitView: () => void
  handleNodeClick: NodeMouseHandler
  incomingModules: RelationModuleItemType[]
  incomingRelationsCount: number
  nodes: Node<ModuleNodeDataType>[]
  onEdgesChange: OnEdgesChange
  onNodesChange: OnNodesChange
  outgoingModules: RelationModuleItemType[]
  outgoingRelationsCount: number
  selectedModule: ModuleType | undefined
}
