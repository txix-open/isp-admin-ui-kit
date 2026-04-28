import Dagre from '@dagrejs/dagre'
import { Node, Edge } from 'reactflow'

import {
  DAGRE_GRAPH_CONFIG,
  NODE_WIDTH,
  NODE_HEIGHT
} from '@constants/modulesRelationsDiagram'

export const layoutGraph = (nodes: Node[], edges: Edge[]): Node[] => {
  const dagreGraph = new Dagre.graphlib.Graph()
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph(DAGRE_GRAPH_CONFIG)

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT })
  )
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target))

  Dagre.layout(dagreGraph)

  return nodes.map((node) => {
    const pos = dagreGraph.node(node.id)
    if (!pos) return node
    return {
      ...node,
      position: { x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 }
    }
  })
}
