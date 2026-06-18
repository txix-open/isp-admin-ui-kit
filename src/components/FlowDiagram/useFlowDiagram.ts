import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import {
  MarkerType,
  type NodeMouseHandler,
  useEdgesState,
  useNodesState,
  useReactFlow
} from 'reactflow'

import {
  DEFAULT_EDGE_COLOR,
  EDGE_OFFSETS,
  INCOMING_EDGE_COLOR,
  MAX_ANIMATED_EDGES,
  MUTED_EDGE_COLOR
} from '@constants/modulesRelationsDiagram'

import {
  type FlowDiagramPropsType,
  type FlowDiagramStateType,
  type RelationModuleItemType,
  type SelectedRelationsType
} from '@components/FlowDiagram/flow-diagram.type'
import { type ModuleNodeDataType } from '@components/ModuleNode/module-node.type'

import { layoutGraph } from '@utils/layoutGraph'

const createRelationKey = (
  source: string,
  target: string,
  index: number
): string => `${source}-${target}-${index}`

export const useFlowDiagram = ({
  modules,
  relations,
  isLoading
}: FlowDiagramPropsType): FlowDiagramStateType => {
  const [nodes, setNodes, onNodesChange] = useNodesState<ModuleNodeDataType>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const { fitView, getNodes } = useReactFlow()

  const moduleById = useMemo(
    () => new Map(modules.map((module) => [module.id, module])),
    [modules]
  )
  const selectedModule = selectedNodeId
    ? moduleById.get(selectedNodeId)
    : undefined

  const selectedRelations = useMemo<SelectedRelationsType>(() => {
    const incoming: SelectedRelationsType['incoming'] = []
    const outgoing: SelectedRelationsType['outgoing'] = []

    if (!selectedNodeId) {
      return { incoming, outgoing }
    }

    for (const relation of relations) {
      if (relation.source === selectedNodeId) {
        outgoing.push(relation)
      }

      if (relation.target === selectedNodeId) {
        incoming.push(relation)
      }
    }

    return { incoming, outgoing }
  }, [relations, selectedNodeId])

  const connectedNodeIds = useMemo(() => {
    const ids = new Set<string>()

    if (!selectedNodeId) {
      return ids
    }

    ids.add(selectedNodeId)
    selectedRelations.incoming.forEach((relation) => ids.add(relation.source))
    selectedRelations.outgoing.forEach((relation) => ids.add(relation.target))

    return ids
  }, [selectedNodeId, selectedRelations])

  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNodeId((currentId) => (currentId === nodeId ? null : nodeId))
  }, [])

  const handleClearSelection = useCallback(() => {
    setSelectedNodeId(null)
  }, [])

  useLayoutEffect(() => {
    if (isLoading) {
      return
    }

    if (modules.length === 0) {
      setNodes([])
      setEdges([])
      setSelectedNodeId(null)
      return
    }

    const incomingCounts = new Map<string, number>()
    const outgoingCounts = new Map<string, number>()

    relations.forEach((relation) => {
      incomingCounts.set(
        relation.target,
        (incomingCounts.get(relation.target) ?? 0) + 1
      )
      outgoingCounts.set(
        relation.source,
        (outgoingCounts.get(relation.source) ?? 0) + 1
      )
    })

    const flowNodes = modules.map((module) => ({
      id: module.id,
      type: 'moduleNode',
      position: { x: 0, y: 0 },
      data: {
        id: module.id,
        name: module.name,
        incomingCount: incomingCounts.get(module.id) ?? 0,
        outgoingCount: outgoingCounts.get(module.id) ?? 0,
        isConnected: false,
        isDimmed: false,
        isSelected: false
      }
    }))

    const flowEdges = relations.map((relation, index) => ({
      id: `edge-${createRelationKey(relation.source, relation.target, index)}`,
      source: relation.source,
      target: relation.target,
      type: 'smoothstep',
      pathOptions: {
        borderRadius: 14,
        offset: EDGE_OFFSETS[index % EDGE_OFFSETS.length]
      },
      style: {
        opacity: 0.7,
        stroke: DEFAULT_EDGE_COLOR,
        strokeWidth: 1.8
      },
      interactionWidth: 18,
      markerEnd: { type: MarkerType.ArrowClosed, color: DEFAULT_EDGE_COLOR }
    }))

    setNodes(layoutGraph(flowNodes, flowEdges))
    setEdges(flowEdges)
    setSelectedNodeId((currentId) =>
      currentId && moduleById.has(currentId) ? currentId : null
    )
  }, [moduleById, modules, relations, isLoading, setNodes, setEdges])

  const displayNodes = useMemo(
    () =>
      nodes.map((node) => {
        const hasSelection = selectedNodeId !== null
        const isSelected = node.id === selectedNodeId
        const isConnected = hasSelection && connectedNodeIds.has(node.id)
        const isDimmed = hasSelection && !isConnected

        return {
          ...node,
          selected: isSelected,
          zIndex: isSelected ? 20 : isConnected ? 10 : 1,
          data: {
            ...node.data,
            isConnected: isConnected && !isSelected,
            isDimmed,
            isSelected,
            onSelect: handleSelectNode
          }
        }
      }),
    [connectedNodeIds, handleSelectNode, nodes, selectedNodeId]
  )

  const displayEdges = useMemo(() => {
    const selectedRelationsCount =
      selectedRelations.incoming.length + selectedRelations.outgoing.length
    const shouldAnimateRelatedEdges =
      selectedRelationsCount > 0 && selectedRelationsCount <= MAX_ANIMATED_EDGES

    return edges.map((edge) => {
      const isIncoming = edge.target === selectedNodeId
      const isOutgoing = edge.source === selectedNodeId
      const isRelated = isIncoming || isOutgoing
      const isDimmed = selectedNodeId !== null && !isRelated
      const strokeColor = isDimmed
        ? MUTED_EDGE_COLOR
        : isIncoming
          ? INCOMING_EDGE_COLOR
          : DEFAULT_EDGE_COLOR
      const classNames = ['flow-diagram__edge']

      if (isIncoming) {
        classNames.push('flow-diagram__edge--incoming')
      }

      if (isOutgoing) {
        classNames.push('flow-diagram__edge--outgoing')
      }

      if (isDimmed) {
        classNames.push('flow-diagram__edge--dimmed')
      }

      return {
        ...edge,
        animated: shouldAnimateRelatedEdges && isRelated,
        className: classNames.join(' '),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
          width: isRelated ? 18 : 14,
          height: isRelated ? 18 : 14
        },
        style: {
          ...edge.style,
          opacity: isDimmed ? 0.16 : isRelated ? 1 : 0.7,
          stroke: strokeColor,
          strokeWidth: isRelated ? 3 : 1.8
        },
        zIndex: isRelated ? 20 : isDimmed ? 0 : 1
      }
    })
  }, [edges, selectedNodeId, selectedRelations])

  const incomingModules = useMemo<RelationModuleItemType[]>(
    () =>
      selectedRelations.incoming.map((relation, index) => ({
        id: relation.source,
        key: createRelationKey(relation.source, relation.target, index),
        name: moduleById.get(relation.source)?.name ?? relation.source,
        onSelect: () => handleSelectNode(relation.source)
      })),
    [handleSelectNode, moduleById, selectedRelations.incoming]
  )
  const outgoingModules = useMemo<RelationModuleItemType[]>(
    () =>
      selectedRelations.outgoing.map((relation, index) => ({
        id: relation.target,
        key: createRelationKey(relation.source, relation.target, index),
        name: moduleById.get(relation.target)?.name ?? relation.target,
        onSelect: () => handleSelectNode(relation.target)
      })),
    [handleSelectNode, moduleById, selectedRelations.outgoing]
  )

  const handleFitView = useCallback(() => {
    if (getNodes().length) {
      fitView({ padding: 0.2, duration: 300 })
    }
  }, [fitView, getNodes])

  const handleNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.stopPropagation()
      handleSelectNode(node.id)
    },
    [handleSelectNode]
  )

  return {
    edges: displayEdges,
    handleClearSelection,
    handleFitView,
    handleNodeClick,
    incomingModules,
    incomingRelationsCount: selectedRelations.incoming.length,
    nodes: displayNodes,
    onEdgesChange,
    onNodesChange,
    outgoingRelationsCount: selectedRelations.outgoing.length,
    outgoingModules,
    selectedModule
  }
}
