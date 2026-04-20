// Mock API Service for HR Workflow Designer
// Simulates backend API calls for workflow operations

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export interface SimulationResponse {
  success: boolean;
  executionId: string;
  steps: Array<{
    nodeId: string;
    status: 'success' | 'failed';
    timestamp: string;
    duration: number;
  }>;
  errors?: string[];
}

export interface ValidationResponse {
  valid: boolean;
  errors: string[];
  warnings: string[];
  suggestions?: string[];
}

export interface AutomationAction {
  id: string;
  name: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  description: string;
  category: string;
}

// Mock database of saved workflows
const mockWorkflows: WorkflowDefinition[] = [
  {
    id: 'wf-001',
    name: 'New Employee Onboarding',
    description: 'Complete onboarding process for new hires',
    nodes: [],
    edges: [],
    createdAt: '2026-04-15T10:00:00Z',
    updatedAt: '2026-04-20T09:30:00Z'
  },
  {
    id: 'wf-002',
    name: 'Employee Exit Process',
    description: 'Offboarding workflow for departing employees',
    nodes: [],
    edges: [],
    createdAt: '2026-04-10T14:20:00Z',
    updatedAt: '2026-04-18T16:45:00Z'
  }
];

// Mock automation actions available in the system
const mockAutomations: AutomationAction[] = [
  {
    id: 'auto-001',
    name: 'Fetch Employee Data',
    endpoint: '/api/employee-data',
    method: 'GET',
    description: 'Retrieve employee information from HR system',
    category: 'Data Retrieval'
  },
  {
    id: 'auto-002',
    name: 'Send Welcome Email',
    endpoint: '/api/send-email',
    method: 'POST',
    description: 'Send automated welcome email to new employee',
    category: 'Communication'
  },
  {
    id: 'auto-003',
    name: 'Update Employee Status',
    endpoint: '/api/update-status',
    method: 'PUT',
    description: 'Update employee status in the system',
    category: 'Data Modification'
  },
  {
    id: 'auto-004',
    name: 'Generate Documents',
    endpoint: '/api/generate-documents',
    method: 'POST',
    description: 'Auto-generate onboarding documents',
    category: 'Document Management'
  },
  {
    id: 'auto-005',
    name: 'Create Access Credentials',
    endpoint: '/api/create-credentials',
    method: 'POST',
    description: 'Set up system access and credentials',
    category: 'Security'
  },
  {
    id: 'auto-006',
    name: 'Schedule Training',
    endpoint: '/api/schedule-training',
    method: 'POST',
    description: 'Automatically schedule required training sessions',
    category: 'Training'
  }
];

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class MockApiService {
  /**
   * Fetch all available automation actions
   */
  static async getAutomations(): Promise<AutomationAction[]> {
    await delay(300);
    return [...mockAutomations];
  }

  /**
   * Fetch available automation actions by category
   */
  static async getAutomationsByCategory(category: string): Promise<AutomationAction[]> {
    await delay(200);
    return mockAutomations.filter(a => a.category === category);
  }

  /**
   * Save workflow to backend
   */
  static async saveWorkflow(workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    await delay(500);

    const savedWorkflow: WorkflowDefinition = {
      id: workflow.id || `wf-${Date.now()}`,
      name: workflow.name || 'Untitled Workflow',
      description: workflow.description || '',
      nodes: workflow.nodes || [],
      edges: workflow.edges || [],
      createdAt: workflow.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return savedWorkflow;
  }

  /**
   * Load workflow from backend
   */
  static async loadWorkflow(id: string): Promise<WorkflowDefinition | null> {
    await delay(400);
    const workflow = mockWorkflows.find(w => w.id === id);
    return workflow || null;
  }

  /**
   * List all saved workflows
   */
  static async listWorkflows(): Promise<WorkflowDefinition[]> {
    await delay(300);
    return [...mockWorkflows];
  }

  /**
   * Delete workflow
   */
  static async deleteWorkflow(id: string): Promise<boolean> {
    await delay(300);
    return true; // Mock success
  }

  /**
   * Validate workflow structure
   */
  static async validateWorkflow(nodes: any[], edges: any[]): Promise<ValidationResponse> {
    await delay(600);

    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validation logic
    const startNodes = nodes.filter(n => n.data.type === 'start');
    const endNodes = nodes.filter(n => n.data.type === 'end');

    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one Start node');
    }
    if (startNodes.length > 1) {
      warnings.push('Multiple Start nodes detected - only the first will execute');
    }
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one End node');
    }

    // Check for disconnected nodes
    nodes.forEach(node => {
      if (node.data.type !== 'start' && node.data.type !== 'end') {
        const hasIncoming = edges.some(e => e.target === node.id);
        const hasOutgoing = edges.some(e => e.source === node.id);

        if (!hasIncoming) {
          warnings.push(`Node "${node.data.label}" has no incoming connections`);
        }
        if (!hasOutgoing) {
          warnings.push(`Node "${node.data.label}" has no outgoing connections`);
        }
      }
    });

    // Check approval nodes
    nodes.forEach(node => {
      if (node.data.type === 'approval') {
        const outgoingEdges = edges.filter(e => e.source === node.id);
        if (outgoingEdges.length < 2) {
          warnings.push(`Approval node "${node.data.label}" should have two branches (Approved/Rejected)`);
        }
        if (!node.data.approver) {
          suggestions.push(`Consider assigning an approver to "${node.data.label}"`);
        }
      }
    });

    // Check automated steps
    nodes.forEach(node => {
      if (node.data.type === 'automated' && !node.data.action) {
        suggestions.push(`Automated step "${node.data.label}" should have an API action configured`);
      }
    });

    // Cycle detection
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);

      const outgoingEdges = edges.filter(e => e.source === nodeId);
      for (const edge of outgoingEdges) {
        if (!visited.has(edge.target)) {
          if (hasCycle(edge.target)) return true;
        } else if (recursionStack.has(edge.target)) {
          return true;
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of nodes) {
      if (!visited.has(node.id)) {
        if (hasCycle(node.id)) {
          errors.push(`Cycle detected in workflow - infinite loops are not allowed`);
          break;
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * Simulate workflow execution
   */
  static async simulateWorkflow(nodes: any[], edges: any[]): Promise<SimulationResponse> {
    await delay(800);

    const startNode = nodes.find(n => n.data.type === 'start');
    if (!startNode) {
      return {
        success: false,
        executionId: '',
        steps: [],
        errors: ['No start node found']
      };
    }

    const steps: SimulationResponse['steps'] = [];
    const visited = new Set<string>();

    const executeNode = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodes.find(n => n.id === nodeId);
      if (!node) return;

      // Simulate execution time based on node type
      const duration = {
        start: 50,
        task: Math.random() * 200 + 100,
        approval: Math.random() * 300 + 200,
        automated: Math.random() * 400 + 300,
        end: 50
      }[node.data.type] || 100;

      steps.push({
        nodeId,
        status: 'success',
        timestamp: new Date().toISOString(),
        duration: Math.round(duration)
      });

      // Follow edges
      const outgoingEdges = edges.filter(e => e.source === nodeId);
      outgoingEdges.forEach(edge => executeNode(edge.target));
    };

    executeNode(startNode.id);

    return {
      success: true,
      executionId: `exec-${Date.now()}`,
      steps
    };
  }

  /**
   * Get workflow execution history
   */
  static async getExecutionHistory(workflowId: string): Promise<any[]> {
    await delay(400);
    return [
      {
        executionId: 'exec-001',
        workflowId,
        status: 'completed',
        startTime: '2026-04-20T08:00:00Z',
        endTime: '2026-04-20T08:15:30Z',
        duration: 930000
      },
      {
        executionId: 'exec-002',
        workflowId,
        status: 'completed',
        startTime: '2026-04-19T14:20:00Z',
        endTime: '2026-04-19T14:32:15Z',
        duration: 735000
      }
    ];
  }

  /**
   * Export workflow as JSON
   */
  static exportWorkflow(nodes: any[], edges: any[]): string {
    return JSON.stringify({
      version: '1.0',
      exportedAt: new Date().toISOString(),
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
    }, null, 2);
  }

  /**
   * Import workflow from JSON
   */
  static async importWorkflow(jsonString: string): Promise<{ nodes: any[], edges: any[] }> {
    await delay(300);
    try {
      const data = JSON.parse(jsonString);
      return {
        nodes: data.nodes || [],
        edges: data.edges || []
      };
    } catch (error) {
      throw new Error('Invalid workflow JSON format');
    }
  }
}
