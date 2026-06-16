import { Tooltip } from 'antd'
import { Handle, Position, type NodeProps } from 'reactflow'

import { type ModuleNodeDataType } from '@components/ModuleNode/module-node.type'
import { useModuleNode } from '@components/ModuleNode/useModuleNode'

import './module-node.scss'

export const ModuleNode = ({ data }: NodeProps<ModuleNodeDataType>) => {
  const {
    containerStyle,
    handleClick,
    handleKeyDown,
    handleStyle,
    headerStyle,
    metaStyle
  } = useModuleNode(data)

  return (
    <>
      <Handle type="target" position={Position.Left} style={handleStyle} />
      <div
        className="module-node__container"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        style={containerStyle}
      >
        <div className="module-node__header" style={headerStyle}>
          <Tooltip title={data.id}>
            <span className="module-node__header-title">{data.name}</span>
          </Tooltip>
        </div>
        <div className="module-node__meta" style={metaStyle}>
          <Tooltip title="Требуется для">
            <span className="module-node__meta-item">
              ← {data.incomingCount}
            </span>
          </Tooltip>
          <Tooltip title="Зависит от">
            <span className="module-node__meta-item">
              → {data.outgoingCount}
            </span>
          </Tooltip>
        </div>
      </div>
      <Handle type="source" position={Position.Right} style={handleStyle} />
    </>
  )
}

export const nodeTypes = { moduleNode: ModuleNode }
