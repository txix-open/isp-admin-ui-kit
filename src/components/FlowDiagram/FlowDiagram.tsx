import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CloseOutlined,
  ExpandOutlined
} from '@ant-design/icons'
import { Button, Spin, Tooltip, theme } from 'antd'
import { type WheelEvent } from 'react'
import ReactFlow, { Background, Panel, ReactFlowProvider } from 'reactflow'

import {
  DEFAULT_EDGE_COLOR,
  INCOMING_EDGE_COLOR
} from '@constants/modulesRelationsDiagram'

import { type FlowDiagramPropsType } from '@components/FlowDiagram/flow-diagram.type'
import { useFlowDiagram } from '@components/FlowDiagram/useFlowDiagram'
import { nodeTypes } from '@components/ModuleNode/ModuleNode'

import './flow-diagram.scss'

import 'reactflow/dist/style.css'

const FlowDiagramContent = ({
  modules,
  relations,
  isLoading
}: FlowDiagramPropsType) => {
  const { token } = theme.useToken()
  const getTooltipContainer = (triggerNode: HTMLElement) =>
    (triggerNode.closest('.flow-diagram__focus-panel') as HTMLElement | null) ??
    triggerNode.parentElement ??
    document.body
  const stopFlowWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.stopPropagation()
  }
  const {
    edges,
    handleClearSelection,
    handleFitView,
    handleNodeClick,
    incomingModules,
    incomingRelationsCount,
    nodes,
    onEdgesChange,
    onNodesChange,
    outgoingRelationsCount,
    outgoingModules,
    selectedModule
  } = useFlowDiagram({ modules, relations, isLoading })

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
        onNodeClick={handleNodeClick}
        onPaneClick={handleClearSelection}
        nodeTypes={nodeTypes}
        minZoom={0.1}
        maxZoom={2}
        onlyRenderVisibleElements
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
      >
        <Background gap={20} size={1} />
        {selectedModule && (
          <Panel position="top-left">
            <div
              className="flow-diagram__focus-panel nowheel nopan"
              style={{
                background: token.colorBgElevated,
                borderColor: token.colorBorder,
                boxShadow: token.boxShadowSecondary,
                color: token.colorText
              }}
            >
              <div className="flow-diagram__focus-panel-header">
                <Tooltip
                  classNames={{ root: 'flow-diagram__tooltip' }}
                  getPopupContainer={getTooltipContainer}
                  title={selectedModule.id}
                >
                  <span className="flow-diagram__focus-panel-title">
                    {selectedModule.name}
                  </span>
                </Tooltip>
                <Button
                  aria-label="Сбросить выбор"
                  icon={<CloseOutlined />}
                  onClick={handleClearSelection}
                  size="small"
                  type="text"
                />
              </div>

              <div className="flow-diagram__focus-panel-counters">
                <span
                  className="flow-diagram__focus-panel-counter flow-diagram__focus-panel-counter--incoming"
                  style={{ borderColor: INCOMING_EDGE_COLOR }}
                >
                  <ArrowLeftOutlined /> {incomingRelationsCount}
                </span>
                <span
                  className="flow-diagram__focus-panel-counter flow-diagram__focus-panel-counter--outgoing"
                  style={{ borderColor: DEFAULT_EDGE_COLOR }}
                >
                  <ArrowRightOutlined /> {outgoingRelationsCount}
                </span>
              </div>

              <div className="flow-diagram__focus-panel-section">
                <span className="flow-diagram__focus-panel-label">
                  Зависит от
                </span>
                <div
                  className="flow-diagram__focus-panel-list nowheel nopan"
                  onWheelCapture={stopFlowWheel}
                >
                  {outgoingModules.length ? (
                    outgoingModules.map((module) => (
                      <Tooltip
                        classNames={{ root: 'flow-diagram__tooltip' }}
                        getPopupContainer={getTooltipContainer}
                        key={module.key}
                        title={module.id}
                      >
                        <button
                          className="flow-diagram__focus-panel-link"
                          onClick={module.onSelect}
                          style={{ color: token.colorText }}
                          type="button"
                        >
                          {module.name}
                        </button>
                      </Tooltip>
                    ))
                  ) : (
                    <span className="flow-diagram__focus-panel-empty">—</span>
                  )}
                </div>
              </div>

              <div className="flow-diagram__focus-panel-section">
                <span className="flow-diagram__focus-panel-label">
                  Требуется для
                </span>
                <div
                  className="flow-diagram__focus-panel-list nowheel nopan"
                  onWheelCapture={stopFlowWheel}
                >
                  {incomingModules.length ? (
                    incomingModules.map((module) => (
                      <Tooltip
                        classNames={{ root: 'flow-diagram__tooltip' }}
                        getPopupContainer={getTooltipContainer}
                        key={module.key}
                        title={module.id}
                      >
                        <button
                          className="flow-diagram__focus-panel-link"
                          onClick={module.onSelect}
                          style={{ color: token.colorText }}
                          type="button"
                        >
                          {module.name}
                        </button>
                      </Tooltip>
                    ))
                  ) : (
                    <span className="flow-diagram__focus-panel-empty">—</span>
                  )}
                </div>
              </div>
            </div>
          </Panel>
        )}
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

export const FlowDiagram = (props: FlowDiagramPropsType) => (
  <ReactFlowProvider>
    <FlowDiagramContent {...props} />
  </ReactFlowProvider>
)
