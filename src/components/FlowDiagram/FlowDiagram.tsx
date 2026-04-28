import { ExpandOutlined } from '@ant-design/icons'
import { Button, Spin, theme } from 'antd'
import { useLayoutEffect, useCallback } from 'react'
import ReactFlow, {
  Background,
  Panel,
  useNodesState,
  useEdgesState,
  MarkerType,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow'

import { nodeTypes } from '@components/ModuleNode/ModuleNode'

import { ModuleType } from '@pages/ModulesPage/module.type'

import { layoutGraph } from '@utils/layoutGraph'

import { ModuleRelation } from '@type/ModuleRelation.type'

import './flow-diagram.scss'

import 'reactflow/dist/style.css'

const FlowDiagramContent = ({
  modules,
  relations,
  isLoading
}: {
  modules: ModuleType[]
  relations: ModuleRelation[]
  isLoading: boolean
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const { fitView, getNodes } = useReactFlow()
  const { token } = theme.useToken()

  useLayoutEffect(() => {
    if (modules.length === 0 || isLoading) return

    const flowNodes = modules.map((module) => ({
      id: module.id,
      type: 'moduleNode',
      position: { x: 0, y: 0 },
      data: { id: module.id, name: module.name }
    }))

    const flowEdges = relations.map((relation, idx) => ({
      id: `edge-${idx}`,
      source: relation.source,
      target: relation.target,
      type: 'smoothstep',
      style: { stroke: '#fa8c16', strokeWidth: 2 },
      markerEnd: { type: MarkerType.ArrowClosed }
    }))

    const layoutedNodes = layoutGraph(flowNodes, flowEdges)

    setNodes(layoutedNodes)
    setEdges(flowEdges)
  }, [modules, relations, isLoading, setNodes, setEdges])

  const handleFitView = useCallback(() => {
    if (getNodes().length) {
      fitView({ padding: 0.2, duration: 300 })
    }
  }, [fitView, getNodes])

  if (isLoading) {
    return (
      <div
        className="flow-diagram__loading"
        style={{ background: token.colorBgContainer }}
      >
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div
      className="flow-diagram"
      style={{
        background: token.colorBgLayout,
        borderColor: token.colorBorder
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background gap={20} size={1} />
        <Panel position="top-right">
          <Button
            size="small"
            icon={<ExpandOutlined />}
            onClick={handleFitView}
          >
            Подогнать
          </Button>
        </Panel>
      </ReactFlow>
    </div>
  )
}

export const FlowDiagram = (
  props: Parameters<typeof FlowDiagramContent>[0]
) => (
  <ReactFlowProvider>
    <FlowDiagramContent {...props} />
  </ReactFlowProvider>
)
