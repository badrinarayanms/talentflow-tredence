# Architecture Documentation

## System Overview

The HR Workflow Designer is a single-page application (SPA) built with React that enables visual workflow design and simulation. This document provides detailed architectural insights for developers and technical stakeholders.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────┐    │
│  │              App.tsx (Root Component)              │    │
│  └────────────┬───────────────────────────────────────┘    │
│               │                                              │
│    ┌──────────┴──────────────────────────────┐             │
│    │                                           │             │
│  ┌─▼────────────┐  ┌──────────────┐  ┌───────▼──────┐    │
│  │ Component    │  │  React Flow  │  │   Config     │    │
│  │  Palette     │  │    Canvas    │  │    Panel     │    │
│  └──────────────┘  └──────┬───────┘  └──────────────┘    │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │   Simulation    │                       │
│                   │     Drawer      │                       │
│                   └────────┬────────┘                       │
│                            │                                 │
│                   ┌────────▼────────┐                       │
│                   │   Mock API      │                       │
│                   │    Service      │                       │
│                   └─────────────────┘                       │
└─────────────────────────────────────────────────────────────┘

                            ↓ (Future)
                            
┌─────────────────────────────────────────────────────────────┐
│                     Backend API (Future)                     │
├─────────────────────────────────────────────────────────────┤
│  - Workflow persistence (Database)                           │
│  - User authentication (OAuth)                               │
│  - Real automation execution                                 │
│  - Webhook integrations                                      │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. App.tsx (Root Component)

**Responsibilities:**
- Application state management (nodes, edges)
- Layout orchestration (3-column + top bar + drawer)
- Event coordination between components
- Export/Import functionality

**State Management:**
```typescript
// React Flow state hooks
const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

// UI state
const [selectedNode, setSelectedNode] = useState<Node | null>(null);
const [isSimulationOpen, setIsSimulationOpen] = useState(false);
```

**Key Functions:**
- `addNode()`: Creates new node on canvas
- `updateNode()`: Updates node configuration
- `onConnect()`: Handles edge creation
- `onNodeClick()`: Selection management
- `clearCanvas()`: Resets workflow
- `exportJSON()`: Serializes workflow to file

**Data Flow:**
```
User Action → App.tsx → State Update → Component Re-render
     ↓
Child Component (ConfigPanel) → Callback → App.tsx → State Update
```

### 2. WorkflowNode.tsx (Custom Node Component)

**Responsibilities:**
- Visual representation of workflow steps
- Display node type with color coding
- Show configuration badges (assignee, action, etc.)
- Handle connection points (source/target handles)

**Props Interface:**
```typescript
interface WorkflowNodeProps {
  data: WorkflowNodeData;  // Node configuration
  selected?: boolean;       // Selection state
}

interface WorkflowNodeData {
  label: string;
  type: 'start' | 'task' | 'approval' | 'automated' | 'end';
  assignee?: string;
  approver?: string;
  action?: string;
  description?: string;
  dueDate?: string;
  threshold?: number;
}
```

**Design Pattern:**
- **Configuration-driven rendering**: Uses `nodeConfig` object for colors/icons
- **Conditional rendering**: Shows different badges based on node type
- **Compound component**: Icon + Text + Badges + Handles

### 3. ComponentPalette.tsx (Left Sidebar)

**Responsibilities:**
- Display available node types
- Handle node creation via click
- Visual categorization of components

**Interaction Pattern:**
```typescript
onClick={() => onAddNode(type)}
  → App.tsx addNode()
    → Creates node with random position
      → setNodes() triggers re-render
```

**Why not drag-and-drop?**
- Click-to-add is simpler UX
- Drag-and-drop requires complex position calculations
- Future enhancement: Could add drag-and-drop from palette

### 4. ConfigPanel.tsx (Right Sidebar)

**Responsibilities:**
- Display configuration form for selected node
- Dynamic form fields based on node type
- Real-time updates to node data
- API integration (fetch automation actions)

**Dynamic Form Logic:**
```typescript
if (selectedNode.data.type === 'task') {
  // Show assignee + due date fields
} else if (selectedNode.data.type === 'approval') {
  // Show approver + threshold slider
} else if (selectedNode.data.type === 'automated') {
  // Show API action dropdown (fetched from API)
}
```

**API Integration:**
```typescript
useEffect(() => {
  if (selectedNode?.data.type === 'automated') {
    loadAutomations();  // Fetch from MockApiService
  }
}, [selectedNode]);
```

**Update Flow:**
```
User types in input
  → handleChange(field, value)
    → setFormData() (local state)
      → onUpdateNode(id, data) (callback to parent)
        → App.tsx updateNode()
          → setNodes() triggers re-render
```

### 5. SimulationDrawer.tsx (Bottom Drawer)

**Responsibilities:**
- Workflow validation (structure checks)
- Simulation execution (graph traversal)
- Results visualization (JSON, logs, errors)
- Three-column layout management

**Validation Algorithm:**
```typescript
async validateWorkflow() {
  1. Check for Start/End nodes
  2. Check for disconnected nodes
  3. Check approval node branching
  4. Run cycle detection (DFS)
  5. Generate errors/warnings/suggestions
}
```

**Simulation Algorithm:**
```typescript
async simulateWorkflow() {
  1. Find Start node
  2. Call MockApiService.simulateWorkflow()
  3. Animate execution steps with delays
  4. Update logs in real-time
  5. Display final results
}
```

**Three-Column Layout:**
- **Left**: JSON Preview (syntax-highlighted code block)
- **Center**: Execution Log (timeline with status icons)
- **Right**: Validation Results (color-coded badges)

## Data Flow Architecture

### State Management Strategy

**Why not Redux/Zustand?**
- Application state is relatively simple
- Most state is local to components
- React Flow provides `useNodesState`/`useEdgesState` hooks
- Prop drilling is minimal (only 1-2 levels)

**State Distribution:**

```
App.tsx (Global)
├── nodes[] (workflow graph data)
├── edges[] (connections)
├── selectedNode (UI state)
└── isSimulationOpen (UI state)

ConfigPanel.tsx (Local)
├── formData (form inputs)
├── automations[] (fetched from API)
└── loading (API state)

SimulationDrawer.tsx (Local)
├── validationResult (validation output)
├── simulationSteps[] (execution log)
├── isSimulating (simulation state)
└── isValidating (validation state)
```

### Event Flow Patterns

**1. Node Creation**
```
ComponentPalette (click)
  → onAddNode(type)
    → App.tsx addNode()
      → setNodes([...nodes, newNode])
        → React Flow re-renders
```

**2. Node Configuration**
```
ConfigPanel (input change)
  → handleChange(field, value)
    → onUpdateNode(id, data)
      → App.tsx updateNode()
        → setNodes(map over nodes)
          → WorkflowNode re-renders
```

**3. Validation**
```
SimulationDrawer (validate button)
  → validateWorkflow()
    → MockApiService.validateWorkflow(nodes, edges)
      → Validation logic (errors/warnings)
        → setValidationResult()
          → Results panel re-renders
```

## Mock API Service Architecture

### Service Layer Pattern

**Purpose:**
- Abstraction between UI and data source
- Simulates backend API behavior
- Easy to swap with real API client

**File: `/src/app/services/mockApi.ts`**

### API Methods

```typescript
class MockApiService {
  // Automation Management
  static async getAutomations(): Promise<AutomationAction[]>
  static async getAutomationsByCategory(category: string)
  
  // Workflow CRUD
  static async saveWorkflow(workflow): Promise<WorkflowDefinition>
  static async loadWorkflow(id: string): Promise<WorkflowDefinition>
  static async listWorkflows(): Promise<WorkflowDefinition[]>
  static async deleteWorkflow(id: string): Promise<boolean>
  
  // Validation & Simulation
  static async validateWorkflow(nodes, edges): Promise<ValidationResponse>
  static async simulateWorkflow(nodes, edges): Promise<SimulationResponse>
  
  // Import/Export
  static exportWorkflow(nodes, edges): string
  static async importWorkflow(jsonString): Promise<{nodes, edges}>
  
  // Analytics (future)
  static async getExecutionHistory(workflowId): Promise<any[]>
}
```

### Mock Data Strategy

**1. In-Memory Storage**
```typescript
const mockWorkflows: WorkflowDefinition[] = [
  { id: 'wf-001', name: 'New Employee Onboarding', ... },
  { id: 'wf-002', name: 'Employee Exit Process', ... }
];
```

**2. Simulated Latency**
```typescript
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

static async getAutomations() {
  await delay(300);  // Simulate network delay
  return [...mockAutomations];
}
```

**3. Realistic Responses**
- Includes metadata (timestamps, IDs)
- Follows RESTful conventions
- Returns TypeScript-typed interfaces

### Migration to Real Backend

**Step 1**: Create `RealApiService` class
```typescript
class RealApiService {
  private baseUrl = 'https://api.example.com';
  
  static async getAutomations() {
    const response = await fetch(`${this.baseUrl}/automations`);
    return response.json();
  }
}
```

**Step 2**: Swap implementation
```typescript
// Before
import { MockApiService as ApiService } from './mockApi';

// After
import { RealApiService as ApiService } from './realApi';

// Usage stays the same
const automations = await ApiService.getAutomations();
```

**Step 3**: Add error handling, auth, retry logic

## Validation & Simulation Algorithms

### Cycle Detection (DFS-based)

**Algorithm**: Depth-First Search with recursion stack

```typescript
function hasCycle(nodeId: string): boolean {
  visited.add(nodeId);
  recursionStack.add(nodeId);  // Track current path
  
  const outgoingEdges = edges.filter(e => e.source === nodeId);
  for (const edge of outgoingEdges) {
    if (!visited.has(edge.target)) {
      if (hasCycle(edge.target)) return true;  // Recurse
    } else if (recursionStack.has(edge.target)) {
      return true;  // Back edge = cycle
    }
  }
  
  recursionStack.delete(nodeId);  // Remove from current path
  return false;
}
```

**Time Complexity**: O(V + E) where V = nodes, E = edges  
**Space Complexity**: O(V) for recursion stack

**Why DFS over BFS?**
- Easier to track current path (recursion stack)
- More intuitive for cycle detection
- Lower memory overhead for sparse graphs

### Disconnected Node Detection

**Algorithm**: Check in-degree and out-degree

```typescript
nodes.forEach(node => {
  if (node.type === 'start' || node.type === 'end') return;
  
  const hasIncoming = edges.some(e => e.target === node.id);
  const hasOutgoing = edges.some(e => e.source === node.id);
  
  if (!hasIncoming) warnings.push(`No incoming edges`);
  if (!hasOutgoing) warnings.push(`No outgoing edges`);
});
```

**Time Complexity**: O(V × E)  
**Optimization opportunity**: Pre-compute adjacency lists

### Workflow Simulation

**Algorithm**: Graph traversal from Start node

```typescript
async function executeNode(nodeId: string) {
  if (visited.has(nodeId)) return;  // Prevent loops
  visited.add(nodeId);
  
  // Log step start
  logStep(nodeId, 'running');
  
  // Simulate execution time
  await delay(randomDuration);
  
  // Log step completion
  logStep(nodeId, 'completed');
  
  // Recursively execute children
  const children = edges.filter(e => e.source === nodeId);
  for (const child of children) {
    await executeNode(child.target);
  }
}
```

**Note**: Current implementation is sequential (one path at a time)  
**Future**: Could simulate parallel execution for approval branches

## Performance Considerations

### Current Bottlenecks

1. **Validation on large graphs**: O(V²) for some checks
2. **Re-renders on config changes**: Updates entire node array
3. **Simulation animation**: Blocks UI thread with delays

### Optimization Strategies

**1. Memoization**
```typescript
const WorkflowNode = React.memo(({ data, selected }) => {
  // Only re-render if data or selected changes
}, (prevProps, nextProps) => {
  return prevProps.data === nextProps.data 
      && prevProps.selected === nextProps.selected;
});
```

**2. Virtual Scrolling** (for large automation lists)
```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={300}
  itemCount={automations.length}
  itemSize={40}
>
  {({ index, style }) => (
    <div style={style}>{automations[index].name}</div>
  )}
</FixedSizeList>
```

**3. Web Workers** (for validation/simulation)
```typescript
// worker.ts
self.addEventListener('message', (e) => {
  const { nodes, edges } = e.data;
  const result = validateWorkflow(nodes, edges);
  self.postMessage(result);
});

// App.tsx
const worker = new Worker('worker.ts');
worker.postMessage({ nodes, edges });
worker.addEventListener('message', (e) => {
  setValidationResult(e.data);
});
```

**4. Debounced Updates**
```typescript
import { useDebouncedCallback } from 'use-debounce';

const debouncedUpdate = useDebouncedCallback(
  (id, data) => onUpdateNode(id, data),
  300  // 300ms delay
);
```

### Scalability Analysis

| Nodes | Edges | Validation Time | Simulation Time | Memory Usage |
|-------|-------|-----------------|-----------------|--------------|
| 10    | 15    | <100ms          | ~5s             | ~5MB         |
| 50    | 75    | ~500ms          | ~25s            | ~15MB        |
| 100   | 150   | ~2s             | ~50s            | ~30MB        |
| 500   | 750   | ~20s*           | ~250s*          | ~100MB       |

*Projected based on algorithm complexity

**Recommendations:**
- For <100 nodes: Current architecture sufficient
- For 100-500 nodes: Implement memoization + web workers
- For >500 nodes: Consider backend-side validation/simulation

## Security Considerations

### Current Implementation (Prototype)

- No authentication/authorization
- No input sanitization (client-side only)
- No CSRF protection
- No XSS protection (React escapes by default)

### Production Hardening Checklist

- [ ] **Authentication**: OAuth 2.0 / JWT tokens
- [ ] **Authorization**: Role-based access control (RBAC)
- [ ] **Input Validation**: Zod/Yup schemas for all user input
- [ ] **API Rate Limiting**: Prevent abuse of validation/simulation
- [ ] **Content Security Policy (CSP)**: Prevent XSS attacks
- [ ] **HTTPS Only**: Enforce secure connections
- [ ] **Dependency Scanning**: Regular `npm audit` checks
- [ ] **Sensitive Data**: Encrypt workflow data at rest

### Example: Input Validation

```typescript
import { z } from 'zod';

const NodeDataSchema = z.object({
  label: z.string().min(1).max(100),
  type: z.enum(['start', 'task', 'approval', 'automated', 'end']),
  assignee: z.string().max(100).optional(),
  description: z.string().max(500).optional()
});

function updateNode(id: string, data: unknown) {
  const validated = NodeDataSchema.parse(data);  // Throws if invalid
  // ... proceed with validated data
}
```

## Testing Strategy

### Unit Testing (Future)

**Tools**: Vitest + React Testing Library

```typescript
// WorkflowNode.test.tsx
import { render, screen } from '@testing-library/react';
import { WorkflowNode } from './WorkflowNode';

test('renders start node with correct icon', () => {
  render(<WorkflowNode data={{ label: 'Start', type: 'start' }} />);
  expect(screen.getByText('Start')).toBeInTheDocument();
  expect(screen.getByRole('img')).toHaveClass('lucide-play');
});
```

### Integration Testing

**Tools**: Playwright / Cypress

```typescript
// workflow.spec.ts
test('create and validate workflow', async ({ page }) => {
  await page.goto('/');
  
  // Add nodes
  await page.click('text=Start');
  await page.click('text=Task');
  
  // Connect nodes
  await page.dragAndDrop('.node-handle-source', '.node-handle-target');
  
  // Open simulation
  await page.click('text=Simulate Workflow');
  
  // Validate
  await page.click('text=Validate');
  await expect(page.locator('.validation-success')).toBeVisible();
});
```

### API Contract Testing

**Tools**: MSW (Mock Service Worker)

```typescript
import { rest } from 'msw';

export const handlers = [
  rest.get('/api/automations', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        { id: '1', name: 'Send Email', endpoint: '/api/send-email' }
      ])
    );
  })
];
```

## Deployment Architecture

### Build Process

```bash
pnpm run build
  → Vite builds optimized bundle
    → Output: /dist/
      ├── index.html
      ├── assets/
      │   ├── index-[hash].js   (~200KB gzipped)
      │   └── index-[hash].css  (~50KB)
      └── ...
```

### Hosting Options

**Option 1: Static Hosting (Vercel/Netlify)**
```yaml
# vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "devCommand": "pnpm run dev"
}
```

**Option 2: Docker Container**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm run build
EXPOSE 3000
CMD ["pnpm", "run", "preview"]
```

**Option 3: CDN + API Backend**
- Frontend: CloudFlare Pages / AWS S3 + CloudFront
- Backend: AWS Lambda / Google Cloud Run

## Extensibility & Plugin System (Future)

### Custom Node Types

```typescript
// Define custom node type
export const CustomNode: NodeType = {
  type: 'database-query',
  icon: Database,
  color: 'rgb(100, 116, 139)',
  configFields: [
    { name: 'query', type: 'textarea', required: true },
    { name: 'database', type: 'select', options: ['MySQL', 'PostgreSQL'] }
  ],
  validate: (data) => {
    if (!data.query) return { error: 'Query is required' };
  }
};

// Register node type
registerNodeType(CustomNode);
```

### Workflow Templates

```typescript
export const templates = [
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Standard new hire workflow',
    nodes: [...],
    edges: [...]
  },
  {
    id: 'offboarding',
    name: 'Employee Exit',
    description: 'Departure process',
    nodes: [...],
    edges: [...]
  }
];
```

### Webhook Integrations

```typescript
export const integrations = {
  slack: {
    name: 'Slack',
    icon: SlackIcon,
    configFields: ['webhook_url', 'channel'],
    trigger: async (event, config) => {
      await fetch(config.webhook_url, {
        method: 'POST',
        body: JSON.stringify({ text: event.message })
      });
    }
  }
};
```

## Conclusion

This architecture provides:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Optimized for 100+ node workflows
- **Extensibility**: Plugin system for custom nodes
- **Testability**: Unit/integration test friendly
- **Performance**: React Flow + memoization strategies

For questions or clarifications, refer to the main README.md or contact the development team.
