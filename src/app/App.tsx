import { useState, useCallback, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import { NodeChange, EdgeChange } from '@xyflow/react';
import { useRef } from 'react';
import { generateWorkflowFromAI } from './services/aiService';
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Download, Trash2, Play } from 'lucide-react';
import { WorkflowNode, type WorkflowNodeData, type NodeType } from './components/WorkflowNode';
import { ComponentPalette } from './components/ComponentPalette';
import { ConfigPanel } from './components/ConfigPanel';
import { SimulationDrawer } from './components/SimulationDrawer';
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react';
import { useHistory } from './hooks/useHistory';


const nodeTypes: NodeTypes = {
  custom: WorkflowNode,
};

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 50 },
    data: { label: 'Start Onboarding', type: 'start' },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 250, y: 200 },
    data: { label: 'Collect Documents', type: 'task', assignee: 'HR Team' },
  },
  {
    id: '3',
    type: 'custom',
    position: { x: 250, y: 350 },
    data: { label: 'Send Welcome Email', type: 'automated', action: 'POST /api/send-email' },
  },
  {
    id: '4',
    type: 'custom',
    position: { x: 250, y: 500 },
    data: { label: 'HR Director Approval', type: 'approval', approver: 'HR Director', threshold: 80 },
  },
  {
    id: '5',
    type: 'custom',
    position: { x: 100, y: 650 },
    data: { label: 'Approved - Complete Onboarding', type: 'end' },
  },
  {
    id: '6',
    type: 'custom',
    position: { x: 400, y: 650 },
    data: { label: 'Rejected - Review Required', type: 'end' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', animated: true, label: 'Approved' },
  { id: 'e4-6', source: '4', target: '6', animated: true, label: 'Rejected' },
];


export default function App() {
  const [workflowName, setWorkflowName] = useState("Untitled Workflow");
  const reactFlowInstance = useRef<any>(null);
  const [selectedNode, setSelectedNode] = useState<Node<WorkflowNodeData> | null>(null);
  const [isSimulationOpen, setIsSimulationOpen] = useState(false);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  const {
    state,
    set,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory<{
    nodes: Node<WorkflowNodeData>[];
    edges: Edge[];
  }>({
    nodes: [],
    edges: [],
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();

        if (event.shiftKey) {
          redo(); // Ctrl + Shift + Z
        } else {
          undo(); // Ctrl + Z
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);
  const nodes = state.nodes;
  const edges = state.edges;
  const handleGenerateAI = async (prompt: string) => {
    if (!prompt) return;

    setLoadingAI(true);

    try {
      const context = {
        nodes: nodes.map(n => ({
          id: n.id,
          type: n.data.type,
          label: n.data.label
        })),
        edges: edges.map(e => ({
          source: e.source,
          target: e.target
        }))
      };

      const aiData = await generateWorkflowFromAI(prompt, context);

      if (!aiData || !aiData.nodes || !Array.isArray(aiData.nodes)) {
        throw new Error("Invalid AI response format");
      }

      const newNodes: Node<WorkflowNodeData>[] = aiData.nodes.map((n: any, index: number) => {
        let extraData: any = { customFields: [] };

        if (n.type === "task") {
          extraData.assignee = n.assignee || "Team";
        } else if (n.type === "approval") {
          extraData.approver = n.approver || "Manager";
          extraData.threshold = n.threshold || 50;
        } else if (n.type === "automated") {
          extraData.action = n.action || "Auto Process";
        }

        return {
          id: n.id || crypto.randomUUID(),
          type: "custom",
          position: n.position || { x: 250, y: index * 120 + 50 },
          data: {
            label: n.label || `New ${n.type}`,
            type: n.type,
            ...extraData,
          },
        };
      });

      const newEdges: Edge[] = (aiData.edges || []).map((e: any, index: number) => ({
        id: `e-${index}`,
        source: e.source,
        target: e.target,
        animated: true,
      }));

      set({ nodes: newNodes, edges: newEdges });

      setTimeout(() => {
        reactFlowInstance.current?.fitView();
      }, 100);

    } catch (err: any) {
      console.error("AI Generation Error:", err);

      // Fallback: Create a simple workflow based on the prompt
      const fallbackNodes = createFallbackWorkflow(prompt);
      set({ nodes: fallbackNodes.nodes, edges: fallbackNodes.edges });

      alert(`AI generation failed: ${err.message}. Created a basic workflow instead.`);
    } finally {
      setLoadingAI(false);
    }
  };

  // Add fallback function
  const createFallbackWorkflow = (prompt: string) => {
    const nodes: Node<WorkflowNodeData>[] = [
      {
        id: '1',
        type: 'custom',
        position: { x: 250, y: 50 },
        data: { label: `Start: ${prompt.substring(0, 30)}`, type: 'start' },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 250, y: 200 },
        data: { label: 'Process Task', type: 'task', assignee: 'Team' },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: { label: 'Review & Approve', type: 'approval', approver: 'Manager' },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 250, y: 500 },
        data: { label: 'Complete', type: 'end' },
      },
    ];

    const edges: Edge[] = [
      { id: 'e1-2', source: '1', target: '2', animated: true },
      { id: 'e2-3', source: '2', target: '3', animated: true },
      { id: 'e3-4', source: '3', target: '4', animated: true },
    ];

    return { nodes, edges };
  };

  const onConnect = useCallback(
    (params: Connection) => {
      set({
        nodes,
        edges: addEdge(params, edges),
      });
    },
    [nodes, edges, set]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node<WorkflowNodeData>) => {
    setSelectedNode(node);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);
  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };
  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData('application/reactflow') as NodeType;

    if (!type) return;

    const bounds = reactFlowWrapper.current?.getBoundingClientRect();
    if (!bounds) return;

    const position = {
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    };

    const newNode: Node<WorkflowNodeData> = {
      id: crypto.randomUUID(),
      type: 'custom',
      position,
      data: {
        label: `New ${type}`,
        type,
      },
    };

    set({
      nodes: [...nodes, newNode],
      edges,
    });
  };

  const addNode = (type: NodeType) => {
    const newNode: Node<WorkflowNodeData> = {
      id: crypto.randomUUID(),
      type: 'custom',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 300 + 100 },
      data: {
        label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
        type,
      },
    };
    set({
      nodes: [...nodes, newNode],
      edges,
    });
  };

  const updateNode = (id: string, data: Partial<WorkflowNodeData>) => {
    set({
      nodes: nodes.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: { ...node.data, ...data },
          };
        }
        return node;
      }),
      edges,
    });
  };

  const loadSampleWorkflow = () => {
    set({
      nodes: [
        {
          id: '1',
          type: 'custom',
          position: { x: 250, y: 50 },
          data: { label: 'Start Process', type: 'start' },
        },
        {
          id: '2',
          type: 'custom',
          position: { x: 250, y: 200 },
          data: { label: 'Task', type: 'task', assignee: 'Team' },
        },
        {
          id: '3',
          type: 'custom',
          position: { x: 250, y: 350 },
          data: { label: 'Approval Step', type: 'approval', approver: 'Manager' },
        },
        {
          id: '4',
          type: 'custom',
          position: { x: 250, y: 500 },
          data: { label: 'Automated Action', type: 'automated', action: 'Send Email' },
        },
        {
          id: '5',
          type: 'custom',
          position: { x: 250, y: 650 },
          data: { label: 'End Process', type: 'end' },
        },
      ],
      edges: [
        { id: 'e1-2', source: '1', target: '2', type: 'default' },
        { id: 'e2-3', source: '2', target: '3', type: 'default' },
        { id: 'e3-4', source: '3', target: '4', type: 'default' },
        { id: 'e4-5', source: '4', target: '5', type: 'default' },
      ],
    });

    // 👇 THIS IS THE IMPORTANT PART
    setTimeout(() => {
      reactFlowInstance.current?.fitView();
    }, 100);
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear the canvas?')) {
      set({
        nodes: [],
        edges: [],
      });
      setSelectedNode(null);
    }
  };

  const exportJSON = () => {
    const workflowData = {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.type,
        data: n.data,
        position: n.position
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        label: e.label
      }))
    };

    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'workflow.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      const updatedNodes = applyNodeChanges(
        changes,
        nodes
      ) as Node<WorkflowNodeData>[]; // ✅ FIX

      set({
        nodes: updatedNodes,
        edges,
      });
    },
    [nodes, edges, set]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      set({
        nodes,
        edges: applyEdgeChanges(changes, edges),
      });
    },
    [nodes, edges, set]
  );

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg" />
          <span className="font-semibold text-gray-800">HR Workflow Designer</span>
        </div>
        <button
          onClick={undo}
          disabled={!canUndo}
          className="px-4 ml-10 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
        >
          Undo
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded disabled:opacity-50"
        >
          Redo
        </button>

        <div className="flex-1 text-center">
          <input
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-center text-gray-700 bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSampleWorkflow}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
          >
            Load Sample
          </button>
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear Canvas
          </button>
          <button
            onClick={exportJSON}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 flex items-center gap-2"
          >
            <Download size={16} />
            Export JSON
          </button>
          <button
            onClick={() => setIsSimulationOpen(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <Play size={16} />
            Simulate Workflow
          </button>
          <input
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe workflow (e.g. onboarding flow)..."
            className="px-3 py-2 border border-gray-300 rounded w-64"
          />

          <button
            onClick={() => {
              if (!aiPrompt.trim()) return;
              handleGenerateAI(aiPrompt);
              setAiPrompt("");
            }}
            disabled={loadingAI}
            className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
          >
            {loadingAI ? "Generating..." : "Generate AI"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <ComponentPalette />

        <div
          className="flex-1 relative"
          ref={reactFlowWrapper}
        >

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            nodeTypes={nodeTypes}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onInit={(instance) => (reactFlowInstance.current = instance)} // ✅ ADD
            minZoom={0.5}
            maxZoom={1.5}
            className="bg-gray-50"
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#94a3b8" />
            <Controls />

            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-gray-400 text-lg">
                  Drag components from left to start building workflow
                </span>
              </div>
            )}
          </ReactFlow>
        </div>

        <ConfigPanel
          selectedNode={selectedNode}
          onUpdateNode={updateNode}
        />
      </div>

      <SimulationDrawer
        isOpen={isSimulationOpen}
        onClose={() => setIsSimulationOpen(false)}
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
}
