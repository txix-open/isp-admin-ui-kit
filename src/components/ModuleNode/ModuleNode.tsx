import { Tooltip, theme } from 'antd'
import { Handle, Position } from 'reactflow'

import './module-node.scss'

export const ModuleNode = ({
  data
}: {
  data: { id: string; name: string }
}) => {
  const { token } = theme.useToken()

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{ width: 8, height: 8 }}
      />
      <div
        className="module-node__container"
        style={{
          background: token.colorBgContainer,
          borderColor: '#73d13d',
          boxShadow: `0 2px 8px ${token.colorBgContainer}`
        }}
      >
        <div
          className="module-node__header"
          style={{ borderBottomColor: token.colorBorder }}
        >
          <Tooltip title={data.id}>
            <span className="module-node__header-title">{data.name}</span>
          </Tooltip>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        style={{ width: 8, height: 8 }}
      />
    </>
  )
}

export const nodeTypes = { moduleNode: ModuleNode }
