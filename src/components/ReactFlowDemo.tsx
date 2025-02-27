import { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';

// 创建起点节点
const startNodes: Node[] = Array.from({ length: 10 }, (_, i) => ({
  id: `start-${i + 1}`,
  type: 'input',
  data: { label: `Input ${i + 1}` },
  position: { x: 20, y: 50 + i * 80 },
  sourcePosition: Position.Right,
  style: {
    background: '#f0f9ff',
    border: '1px solid #93c5fd',
    borderRadius: '8px',
    padding: '10px',
  },
}));

// 创建终点节点
const endNodes: Node[] = Array.from({ length: 5 }, (_, i) => ({
  id: `end-${i + 1}`,
  type: 'output',
  data: { label: `Output ${i + 1}` },
  position: { x: 1000, y: 100 + i * 120 },
  targetPosition: Position.Left,
  style: {
    background: '#fef3f2',
    border: '1px solid #fda4af',
    borderRadius: '8px',
    padding: '10px',
  },
}));

// 创建中间的圆形节点
const middleNodes: Node[] = Array.from({ length: 3 }, (_, i) => ({
  id: `middle-${i + 1}`,
  type: 'default',
  data: { label: `Process ${i + 1}` },
  position: { 
    x: i % 2 === 0 ? 600 : 400,
    y: 200 + i * 200
  },
  targetPosition: Position.Left,
  sourcePosition: Position.Right,
  style: {
    background: '#f0fdf4',
    border: '1px solid #86efac',
    borderRadius: '50%',
    padding: '20px',
    width: 100,
    height: 100,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const initialNodes: Node[] = [
  ...startNodes,
  ...middleNodes,  // 添加中间节点
  ...endNodes,
];

const initialEdges: Edge[] = [
  // 起点1、5、10 连接到中间节点1
  {
    id: 'e-s1-m1',
    source: 'start-1',
    target: 'middle-1',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 300, y: 50 }] }
  },
  {
    id: 'e-s5-m1',
    source: 'start-5',
    target: 'middle-1',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 350, y: 400 }] }
  },
  {
    id: 'e-s10-m1',
    source: 'start-10',
    target: 'middle-1',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 300, y: 750 }] }
  },

  // 起点6、7、2、9 连接到中间节点2
  {
    id: 'e-s6-m2',
    source: 'start-6',
    target: 'middle-2',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 200, y: 450 }] }
  },
  {
    id: 'e-s7-m2',
    source: 'start-7',
    target: 'middle-2',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 250, y: 500 }] }
  },
  {
    id: 'e-s2-m2',
    source: 'start-2',
    target: 'middle-2',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 200, y: 150 }] }
  },
  {
    id: 'e-s9-m2',
    source: 'start-9',
    target: 'middle-2',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 250, y: 650 }] }
  },

  // 起点3、4、8、6 连接到中间节点3
  {
    id: 'e-s3-m3',
    source: 'start-3',
    target: 'middle-3',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 300, y: 200 }] }
  },
  {
    id: 'e-s4-m3',
    source: 'start-4',
    target: 'middle-3',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 350, y: 300 }] }
  },
  {
    id: 'e-s8-m3',
    source: 'start-8',
    target: 'middle-3',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 300, y: 600 }] }
  },
  {
    id: 'e-s6-m3',
    source: 'start-6',
    target: 'middle-3',
    type: 'smoothstep',
    style: { stroke: '#93c5fd' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 250, y: 450 }] }
  },

  // 中间节点1 连接到终点4、2
  {
    id: 'e-m1-e4',
    source: 'middle-1',
    target: 'end-4',
    type: 'smoothstep',
    style: { stroke: '#86efac' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 800, y: 500 }] }
  },
  {
    id: 'e-m1-e2',
    source: 'middle-1',
    target: 'end-2',
    type: 'smoothstep',
    style: { stroke: '#86efac' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 850, y: 300 }] }
  },

  // 中间节点2 连接到终点1、3
  {
    id: 'e-m2-e1',
    source: 'middle-2',
    target: 'end-1',
    type: 'smoothstep',
    style: { stroke: '#86efac' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 800, y: 100 }] }
  },
  {
    id: 'e-m2-e3',
    source: 'middle-2',
    target: 'end-3',
    type: 'smoothstep',
    style: { stroke: '#86efac' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 850, y: 400 }] }
  },

  // 中间节点3 连接到终点5
  {
    id: 'e-m3-e5',
    source: 'middle-3',
    target: 'end-5',
    type: 'smoothstep',
    style: { stroke: '#86efac' },
    sourceHandle: Position.Right,
    targetHandle: Position.Left,
    data: { controlPoints: [{ x: 800, y: 580 }] }
  },
];

export function ReactFlowDemo() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        snapToGrid={true}
        snapGrid={[20, 20]}
      >
        <Controls />
        <MiniMap 
          nodeStrokeColor={(n) => {
            if (n.type === 'input') return '#93c5fd';
            if (n.type === 'output') return '#fda4af';
            if (n.id.startsWith('middle')) return '#86efac';  // 中间节点的边框颜色
            return '#000000';
          }}
          nodeColor={(n) => {
            if (n.type === 'input') return '#f0f9ff';
            if (n.type === 'output') return '#fef3f2';
            if (n.id.startsWith('middle')) return '#f0fdf4';  // 中间节点的填充颜色
            return '#ffffff';
          }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
} 