import { useState } from 'react';
import { X, Play, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import type { Node, Edge } from '@xyflow/react';
import type { WorkflowNodeData } from './WorkflowNode';
import { MockApiService, type ValidationResponse } from '../services/mockApi';

interface SimulationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  nodes: Node<WorkflowNodeData>[];
  edges: Edge[];
}


interface SimulationStep {
  nodeId: string;
  nodeName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  timestamp: string;
  message: string;
}

export function SimulationDrawer({ isOpen, onClose, nodes, edges }: SimulationDrawerProps) {
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);
  const [simulationSteps, setSimulationSteps] = useState<SimulationStep[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  if (!isOpen) return null;

  const validateWorkflow = async () => {
    setIsValidating(true);
    try {
      const result = await MockApiService.validateWorkflow(nodes, edges);
      setValidationResult(result);
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    setSimulationSteps([]);

    try {
      const response = await MockApiService.simulateWorkflow(nodes, edges);

      if (!response.success) {
        setSimulationSteps([{
          nodeId: 'error',
          nodeName: 'Error',
          status: 'failed',
          timestamp: new Date().toISOString(),
          message: response.errors?.join(', ') || 'Simulation failed'
        }]);
        setIsSimulating(false);
        return;
      }

      // Animate the execution steps
      for (const step of response.steps) {
        const node = nodes.find(n => n.id === step.nodeId);
        if (!node) continue;

        setSimulationSteps(prev => [...prev, {
          nodeId: step.nodeId,
          nodeName: node.data.label,
          status: 'running',
          timestamp: step.timestamp,
          message: `Executing ${node.data.type} node...`
        }]);

        await new Promise(resolve => setTimeout(resolve, 600));

        setSimulationSteps(prev => prev.map(s =>
          s.nodeId === step.nodeId
            ? { ...s, status: step.status === 'success' ? 'completed' : 'failed', message: `Completed in ${step.duration}ms` }
            : s
        ));
      }
    } catch (error) {
      console.error('Simulation failed:', error);
    } finally {
      setIsSimulating(false);
    }
  };

  const workflowJSON = JSON.stringify(
    {
      nodes: nodes.map(n => ({
        id: n.id,
        type: n.data.type,
        data: n.data,
        position: n.position
      })),
      edges: edges.map(e => ({
        id: e.id,
        source: e.source,
        target: e.target
      }))
    },
    null,
    2
  );

  return (
    <div className="fixed inset-x-0 bottom-0 bg-white border-t-2 border-gray-300 shadow-2xl" style={{ height: '60vh', zIndex: 1000 }}>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Simulation Sandbox</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={validateWorkflow}
              disabled={isValidating}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
            >
              {isValidating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
              Validate
            </button>
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
            >
              {isSimulating ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Run Simulation
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto border-r border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">JSON Preview</h3>
            <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
              {workflowJSON}
            </pre>
          </div>

          <div className="flex-1 p-4 overflow-y-auto border-r border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">Execution Log</h3>
            <div className="space-y-2">
              {simulationSteps.length === 0 ? (
                <div className="text-gray-500 text-sm">Click "Run Simulation" to start</div>
              ) : (
                simulationSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-gray-50 rounded">
                    {step.status === 'completed' ? (
                      <CheckCircle className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                    ) : step.status === 'running' ? (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mt-0.5" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-gray-300 rounded-full mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800">{step.nodeName}</div>
                      <div className="text-xs text-gray-600">{step.message}</div>
                      <div className="text-xs text-gray-400">{new Date(step.timestamp).toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <h3 className="font-semibold text-gray-700 mb-2">Validation Results</h3>
            {validationResult ? (
              <div className="space-y-2">
                <div className={`flex items-center gap-2 p-3 rounded ${validationResult.valid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {validationResult.valid ? (
                    <CheckCircle size={20} />
                  ) : (
                    <XCircle size={20} />
                  )}
                  <span className="font-medium">
                    {validationResult.valid ? 'Structure Valid' : 'Validation Failed'}
                  </span>
                </div>

                {validationResult.errors.map((error, index) => (
                  <div key={`error-${index}`} className="flex items-start gap-2 p-2 bg-red-50 rounded">
                    <XCircle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                ))}

                {validationResult.warnings.map((warning, index) => (
                  <div key={`warning-${index}`} className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                    <AlertCircle className="text-orange-500 mt-0.5 flex-shrink-0" size={16} />
                    <span className="text-sm text-orange-800">{warning}</span>
                  </div>
                ))}

                {validationResult.errors.length === 0 && validationResult.warnings.length === 0 && (
                  <div className="text-sm text-gray-600">No issues found</div>
                )}

                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div className="mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-1">Suggestions:</div>
                    {validationResult.suggestions.map((suggestion, index) => (
                      <div key={`suggestion-${index}`} className="text-xs text-gray-600 ml-2">
                        • {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Click "Validate" to check workflow structure</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
