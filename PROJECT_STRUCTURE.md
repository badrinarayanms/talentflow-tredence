# Project Structure

Complete file and folder organization for the HR Workflow Designer.

## Directory Tree

```
hr-workflow-designer/
├── src/
│   ├── app/
│   │   ├── App.tsx                          # Main application component
│   │   ├── components/
│   │   │   ├── WorkflowNode.tsx             # Custom React Flow node component
│   │   │   ├── ComponentPalette.tsx         # Left sidebar (node types)
│   │   │   ├── ConfigPanel.tsx              # Right sidebar (node config)
│   │   │   └── SimulationDrawer.tsx         # Bottom drawer (validation/simulation)
│   │   └── services/
│   │       └── mockApi.ts                   # Mock API service layer
│   ├── styles/
│   │   ├── theme.css                        # Tailwind custom tokens
│   │   └── fonts.css                        # Font imports
│   └── imports/                             # Static assets (images, PDFs)
│       ├── image.png
│       ├── image-1.png
│       ├── image-2.png
│       ├── image-3.png
│       ├── image-4.png
│       ├── image-5.png
│       ├── image-6.png
│       ├── image-7.png
│       ├── Gemini_Generated_Image_10cnvy10cnvy10cn.png
│       └── JD_Full_Stack_Engineer_-JD+_Case_Study_-Tredence.pdf
├── guidelines/
│   └── Guidelines.md                        # Design guidelines (empty/reference)
├── node_modules/                            # Dependencies (generated)
├── package.json                             # Project dependencies and scripts
├── pnpm-lock.yaml                           # Dependency lock file
├── vite.config.ts                           # Vite build configuration
├── tsconfig.json                            # TypeScript configuration
├── .gitignore                               # Git ignore rules
├── README.md                                # Main documentation
├── ARCHITECTURE.md                          # Technical architecture details
├── QUICKSTART.md                            # Quick start guide
└── PROJECT_STRUCTURE.md                     # This file
```

## File Descriptions

### Core Application Files

#### `/src/app/App.tsx`
**Purpose**: Root component orchestrating the entire application  
**Responsibilities**:
- Global state management (nodes, edges)
- Layout rendering (3-column + top bar)
- Event handlers (add, update, delete nodes)
- Export/Import functionality

**Key Exports**:
```typescript
export default function App()
```

**Dependencies**:
- React Flow (`@xyflow/react`)
- All child components
- Lucide icons

**Lines of Code**: ~200

---

#### `/src/app/components/WorkflowNode.tsx`
**Purpose**: Custom node component for React Flow canvas  
**Responsibilities**:
- Render node with color-coded design
- Display node type icon (Play, User, ShieldCheck, etc.)
- Show configuration badges (assignee, approver, action)
- Provide connection handles (source/target)

**Key Exports**:
```typescript
export function WorkflowNode({ data, selected }: WorkflowNodeProps)
export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end'
export interface WorkflowNodeData { ... }
```

**Lines of Code**: ~150

---

#### `/src/app/components/ComponentPalette.tsx`
**Purpose**: Left sidebar for adding nodes  
**Responsibilities**:
- Display all 5 node types with icons
- Handle click-to-add interaction
- Visual categorization

**Key Exports**:
```typescript
export function ComponentPalette({ onAddNode }: ComponentPaletteProps)
```

**Lines of Code**: ~60

---

#### `/src/app/components/ConfigPanel.tsx`
**Purpose**: Right sidebar for node configuration  
**Responsibilities**:
- Dynamic form rendering based on selected node type
- Real-time updates to node data
- API integration (fetch automation actions for automated nodes)
- Input validation

**Key Exports**:
```typescript
export function ConfigPanel({ selectedNode, onUpdateNode }: ConfigPanelProps)
```

**API Calls**:
- `MockApiService.getAutomations()` when automated node is selected

**Lines of Code**: ~180

---

#### `/src/app/components/SimulationDrawer.tsx`
**Purpose**: Bottom drawer for workflow testing  
**Responsibilities**:
- Workflow validation (cycle detection, structure checks)
- Simulation execution (graph traversal)
- Results visualization (JSON, logs, validation)
- Three-column layout management

**Key Exports**:
```typescript
export function SimulationDrawer({ isOpen, onClose, nodes, edges }: SimulationDrawerProps)
```

**API Calls**:
- `MockApiService.validateWorkflow(nodes, edges)`
- `MockApiService.simulateWorkflow(nodes, edges)`

**Lines of Code**: ~250

---

#### `/src/app/services/mockApi.ts`
**Purpose**: Mock API service layer  
**Responsibilities**:
- Simulate backend API behavior
- Provide automation actions
- Validate workflow structure
- Simulate workflow execution
- Export/Import workflow JSON

**Key Exports**:
```typescript
export class MockApiService {
  static async getAutomations()
  static async saveWorkflow(workflow)
  static async loadWorkflow(id)
  static async validateWorkflow(nodes, edges)
  static async simulateWorkflow(nodes, edges)
  static exportWorkflow(nodes, edges)
  static async importWorkflow(jsonString)
}

export interface WorkflowDefinition { ... }
export interface SimulationResponse { ... }
export interface ValidationResponse { ... }
export interface AutomationAction { ... }
```

**Mock Data**:
- 6 predefined automation actions
- 2 sample workflows
- Simulated network delays (200-800ms)

**Lines of Code**: ~400

---

### Styling Files

#### `/src/styles/theme.css`
**Purpose**: Tailwind CSS custom tokens and theme variables  
**Contents**:
- Custom color definitions
- Typography scale
- Spacing utilities
- Component-specific styles

#### `/src/styles/fonts.css`
**Purpose**: Font imports and declarations  
**Contents**:
- Google Fonts imports (if any)
- Custom font-face declarations
- Font-family fallback stacks

---

### Configuration Files

#### `/package.json`
**Purpose**: Project metadata and dependencies  
**Key Dependencies**:
- `react@18.3.1`
- `@xyflow/react@12.10.2` (React Flow)
- `tailwindcss@4.1.12`
- `lucide-react@0.487.0` (icons)
- `vite@6.3.5` (build tool)

**Scripts**:
```json
{
  "build": "vite build"
}
```

#### `/vite.config.ts`
**Purpose**: Vite build configuration  
**Contents**:
- React plugin setup
- Tailwind CSS Vite plugin
- Build optimization settings

#### `/tsconfig.json`
**Purpose**: TypeScript compiler configuration  
**Contents**:
- Target: ES6+
- Module: ESNext
- Strict mode enabled
- Path aliases (if any)

---

### Documentation Files

#### `/README.md`
**Purpose**: Main project documentation  
**Contents**:
- Project overview
- Architecture description
- Design system details
- Feature list
- Getting started guide
- Design decisions & rationale
- Assumptions & constraints
- Future enhancements

**Target Audience**: Developers, stakeholders, recruiters

**Word Count**: ~5,000 words

---

#### `/ARCHITECTURE.md`
**Purpose**: Detailed technical architecture guide  
**Contents**:
- System overview diagram
- Component architecture breakdown
- Data flow patterns
- State management strategy
- Mock API service architecture
- Validation/simulation algorithms
- Performance considerations
- Security considerations
- Testing strategy
- Deployment architecture
- Extensibility patterns

**Target Audience**: Senior developers, architects

**Word Count**: ~6,000 words

---

#### `/QUICKSTART.md`
**Purpose**: Quick start guide for new users  
**Contents**:
- Installation instructions
- First workflow tutorial
- Key concepts reference
- Common tasks examples
- Keyboard shortcuts
- Troubleshooting tips
- Example use cases

**Target Audience**: New users, non-technical stakeholders

**Word Count**: ~2,000 words

---

#### `/PROJECT_STRUCTURE.md`
**Purpose**: This file - complete project organization guide  
**Contents**:
- Directory tree
- File descriptions
- Dependencies map
- Build output structure

**Target Audience**: Developers onboarding to the project

---

### Static Assets

#### `/src/imports/*.png`
**Purpose**: Screenshot images and design references  
**Usage**:
- Referenced in README.md for visual documentation
- Design inspiration / mockups

#### `/src/imports/JD_Full_Stack_Engineer_-JD+_Case_Study_-Tredence.pdf`
**Purpose**: Case study requirements document (reference)

---

## Dependencies Map

### Production Dependencies

```
react@18.3.1
  └─ Core UI framework

@xyflow/react@12.10.2
  ├─ React Flow canvas
  ├─ Node/edge state management
  └─ Built-in controls (zoom, pan)

tailwindcss@4.1.12
  ├─ Utility-first CSS framework
  └─ @tailwindcss/vite@4.1.12 (build integration)

lucide-react@0.487.0
  └─ Icon library (Play, User, ShieldCheck, etc.)

@radix-ui/* (multiple packages)
  └─ Accessible UI primitives (if used in future components)

date-fns@3.6.0
  └─ Date utilities (for Task due dates)
```

### Development Dependencies

```
vite@6.3.5
  └─ Build tool and dev server

@vitejs/plugin-react@4.7.0
  └─ React support for Vite

typescript@^5.x (implicit)
  └─ Type checking
```

---

## Build Output Structure

When you run `pnpm run build`, Vite generates:

```
dist/
├── index.html                     # Entry HTML file
├── assets/
│   ├── index-[hash].js           # Bundled JavaScript (~200KB gzipped)
│   ├── index-[hash].css          # Bundled CSS (~50KB)
│   └── [other-assets]            # Fonts, images, etc.
└── ...
```

**Optimization Features**:
- Code splitting (React Flow loaded separately)
- Tree shaking (unused code removed)
- Minification (Terser)
- CSS purging (unused Tailwind classes removed)

---

## Code Statistics

| File | Lines | Complexity |
|------|-------|------------|
| `App.tsx` | ~200 | Medium |
| `WorkflowNode.tsx` | ~150 | Low |
| `ComponentPalette.tsx` | ~60 | Low |
| `ConfigPanel.tsx` | ~180 | Medium |
| `SimulationDrawer.tsx` | ~250 | High |
| `mockApi.ts` | ~400 | Medium |
| **Total** | **~1,240** | - |

**Total Bundle Size** (production):
- JavaScript: ~200KB gzipped
- CSS: ~50KB gzipped
- **Total**: ~250KB (first load)

---

## Module Relationships

```
App.tsx
  ├─ imports ComponentPalette
  │    └─ calls onAddNode() callback
  ├─ imports WorkflowNode
  │    └─ used as custom node type in React Flow
  ├─ imports ConfigPanel
  │    ├─ receives selectedNode prop
  │    ├─ calls onUpdateNode() callback
  │    └─ imports mockApi.ts
  │         └─ calls getAutomations()
  └─ imports SimulationDrawer
       ├─ receives nodes/edges props
       └─ imports mockApi.ts
            ├─ calls validateWorkflow()
            └─ calls simulateWorkflow()
```

---

## Git Structure (Recommended)

```
.gitignore
  - node_modules/
  - dist/
  - .env
  - *.log
```

**Branch Strategy** (for team development):
- `main` → Production-ready code
- `develop` → Integration branch
- `feature/*` → Feature branches
- `bugfix/*` → Bug fix branches

---

## Environment Variables (Future)

```env
# .env.example
VITE_API_URL=https://api.example.com
VITE_AUTH_DOMAIN=auth.example.com
VITE_ENABLE_ANALYTICS=true
```

Currently not used (mock API only).

---

## Testing Structure (Future)

```
tests/
├── unit/
│   ├── WorkflowNode.test.tsx
│   ├── mockApi.test.ts
│   └── validation.test.ts
├── integration/
│   ├── workflow-creation.test.tsx
│   └── simulation.test.tsx
└── e2e/
    ├── user-journey.spec.ts
    └── accessibility.spec.ts
```

---

## Deployment Checklist

- [ ] Run `pnpm run build`
- [ ] Test production build locally
- [ ] Verify all images load correctly
- [ ] Check console for errors/warnings
- [ ] Test on multiple browsers
- [ ] Verify mobile responsiveness (future)
- [ ] Upload `dist/` folder to hosting platform
- [ ] Configure custom domain (if applicable)
- [ ] Set up CI/CD pipeline (GitHub Actions)

---

**Last Updated**: 2026-04-20  
**Project Version**: 1.0.0  
**Maintainer**: Tredence Full-Stack Engineer Case Study
