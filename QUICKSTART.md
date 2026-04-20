# Quick Start Guide

Get up and running with the HR Workflow Designer in 5 minutes.

## Prerequisites

- **Node.js**: Version 18 or higher
- **Package Manager**: pnpm (recommended), npm, or yarn
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)

## Installation

```bash
# Clone the repository (or extract zip)
cd hr-workflow-designer

# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

The application will open in the preview surface.

## First Workflow

### 1. Explore the Default Workflow

The app loads with a pre-configured "New Employee Onboarding" workflow:

- **Start Onboarding** → Entry point
- **Collect Documents** → Task assigned to HR Team
- **Send Welcome Email** → Automated API call
- **HR Director Approval** → Approval decision point
- **Two End nodes** → Approved and Rejected paths

### 2. Modify the Workflow

**Add a new node:**
1. Click any node type in the left sidebar (Component Palette)
2. The node appears on the canvas
3. Drag to reposition

**Connect nodes:**
1. Click and drag from a node's **bottom handle** (source)
2. Release on another node's **top handle** (target)
3. An animated edge appears

**Configure a node:**
1. Click any node on the canvas
2. Right sidebar shows configuration form
3. Edit fields (title, assignee, API action, etc.)
4. Changes apply immediately

### 3. Test the Workflow

**Validate:**
1. Click **"Simulate Workflow"** in the top bar
2. Click **"Validate"** in the drawer
3. Review errors/warnings/suggestions in the right column

**Simulate:**
1. Click **"Run Simulation"** in the drawer
2. Watch execution logs populate in real-time
3. Check JSON preview (left column) for export data

### 4. Export Your Work

1. Click **"Export JSON"** in the top bar
2. File downloads as `workflow.json`
3. Import later or share with team

## Key Concepts

### Node Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| **Start** | Workflow entry point | Title, Description |
| **Task** | Manual human activity | Assignee, Due Date |
| **Approval** | Decision/review step | Approver, Threshold |
| **Automated Step** | API/system integration | API Action (dropdown) |
| **End** | Workflow termination | Title, Description |

### Layout

```
┌────────────────────────────────────────────────────────────┐
│  Top Bar: App Name │ Workflow Name │ Actions (Export/Sim)  │
├────────────┬────────────────────────────┬──────────────────┤
│            │                            │                  │
│ Component  │     React Flow Canvas      │  Configuration   │
│  Palette   │   (Drag, Connect, Zoom)    │      Panel       │
│            │                            │  (Selected Node) │
│            │                            │                  │
└────────────┴────────────────────────────┴──────────────────┘
                          ↓ (Opens on demand)
┌────────────────────────────────────────────────────────────┐
│              Simulation Drawer (60% height)                 │
│  ┌─────────────┬─────────────────┬──────────────────────┐  │
│  │ JSON Preview│ Execution Logs  │ Validation Results   │  │
│  │ (Code)      │ (Timeline)      │ (Errors/Warnings)    │  │
│  └─────────────┴─────────────────┴──────────────────────┘  │
└────────────────────────────────────────────────────────────┘
```

### Validation Rules

✅ **Must Have:**
- At least one Start node
- At least one End node

⚠️ **Warnings:**
- Approval nodes should have 2+ outgoing edges (Approved/Rejected)
- Nodes shouldn't be disconnected (no orphans)

🚫 **Errors:**
- Cycles (infinite loops) are not allowed
- Use validation to detect cycles automatically

## Common Tasks

### Create a Simple Approval Workflow

```
Start
  ↓
Task: Submit Request
  ↓
Approval: Manager Review
  ├─ Approved → End: Complete
  └─ Rejected → End: Denied
```

**Steps:**
1. Click "Start" (left sidebar)
2. Click "Task" → Connect Start → Task
3. Click "Approval" → Connect Task → Approval
4. Click "End" twice (for two outcomes)
5. Connect Approval → End #1 (label: Approved)
6. Connect Approval → End #2 (label: Rejected)
7. Configure Approval node: Set approver to "Manager"

### Add an Automated Email Step

1. Click "Automated Step"
2. Connect it between two nodes
3. Select the node
4. In config panel: Choose "Send Welcome Email (POST /api/send-email)"
5. Validate to ensure proper configuration

### Test for Cycle Errors

1. Create a loop: Node A → Node B → Node A
2. Open Simulation Drawer
3. Click "Validate"
4. Error appears: "Cycle detected in workflow"
5. Fix by removing one edge

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Pan canvas | Click + Drag on background |
| Zoom in/out | Mouse wheel / Pinch |
| Select node | Click node |
| Deselect | Click background |
| Delete node | Select + Delete key *(future)* |

## Troubleshooting

### "No automation actions loading"

**Issue**: Automated Step dropdown is empty  
**Solution**: Check browser console for errors. Mock API should respond in ~300ms.

### "Validation not running"

**Issue**: Clicking "Validate" does nothing  
**Solution**: Ensure simulation drawer is open. Check console for errors.

### "Workflow looks messy"

**Issue**: Nodes overlap or are poorly positioned  
**Solution**: 
- Manually drag nodes to organize
- Use React Flow's "Fit View" button (bottom controls)
- Future: Auto-layout algorithms

### "Can't connect nodes"

**Issue**: Edge won't connect  
**Solution**:
- Drag from **bottom handle** (source) to **top handle** (target)
- Start/End nodes have restrictions (Start = no incoming, End = no outgoing)

## Next Steps

- **Read the Architecture**: See `ARCHITECTURE.md` for technical deep-dive
- **Explore Mock API**: Review `/src/app/services/mockApi.ts` for integration patterns
- **Customize Nodes**: Modify `WorkflowNode.tsx` to add custom fields
- **Add Templates**: Create pre-built workflows in `App.tsx`
- **Deploy**: Build with `pnpm run build` and host on Vercel/Netlify

## Example Use Cases

### HR Workflows
- New employee onboarding
- Performance review process
- Time-off approval
- Exit interviews

### IT Operations
- Incident response workflow
- Change request approval
- Access provisioning
- Software deployment pipeline

### Sales Processes
- Lead qualification
- Quote approval
- Contract review
- Customer onboarding

## Resources

- **Full Documentation**: [README.md](./README.md)
- **Architecture Guide**: [ARCHITECTURE.md](./ARCHITECTURE.md)
- **React Flow Docs**: https://reactflow.dev
- **Tailwind CSS**: https://tailwindcss.com
- **Lucide Icons**: https://lucide.dev

## Support

For questions or issues:
- Review the README.md for detailed explanations
- Check the ARCHITECTURE.md for technical details
- Inspect the code comments in `/src/app/` components

---

**Ready to build?** Start by modifying the default workflow and clicking "Simulate Workflow" to see it in action!
