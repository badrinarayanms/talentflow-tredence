import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import type { WorkflowNodeData } from './WorkflowNode';
import { Play, User, ShieldCheck, Settings, StopCircle, Loader2 } from 'lucide-react';
import { MockApiService, type AutomationAction } from '../services/mockApi';

interface ConfigPanelProps {
  selectedNode: Node<WorkflowNodeData> | null;
  onUpdateNode: (id: string, data: Partial<WorkflowNodeData>) => void;
}


const nodeIcons = {
  start: Play,
  task: User,
  approval: ShieldCheck,
  automated: Settings,
  end: StopCircle
};

const nodeColors = {
  start: 'text-blue-500',
  task: 'text-orange-500',
  approval: 'text-purple-500',
  automated: 'text-green-500',
  end: 'text-red-500'
};

export function ConfigPanel({ selectedNode, onUpdateNode }: ConfigPanelProps) {
  const [formData, setFormData] = useState<Partial<WorkflowNodeData>>({});
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const handleCustomFieldChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedFields = [...(formData.customFields || [])];
    updatedFields[index] = {
      ...updatedFields[index],
      [field]: value,
    };

    handleChange('customFields', updatedFields);
  };

  const addCustomField = () => {
    const updatedFields = [...(formData.customFields || []), { key: '', value: '' }];
    handleChange('customFields', updatedFields);
  };

  const removeCustomField = (index: number) => {
    const updatedFields = (formData.customFields || []).filter((_, i) => i !== index);
    handleChange('customFields', updatedFields);
  };

  useEffect(() => {
    if (selectedNode) {
      setFormData({
        ...selectedNode.data,
        customFields: selectedNode.data.customFields || [],
      });

      // Load automations when automated node is selected
      if (selectedNode.data.type === 'automated') {
        loadAutomations();
      }
    }
  }, [selectedNode]);

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const data = await MockApiService.getAutomations();
      setAutomations(data);
    } catch (error) {
      console.error('Failed to load automations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedNode) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6">
        <div className="text-gray-500 text-center mt-8">
          Select a node to configure
        </div>
      </div>
    );
  }

  const Icon = nodeIcons[selectedNode.data.type];
  const colorClass = nodeColors[selectedNode.data.type];

  const handleChange = (field: string, value: any) => {
    const newData = { ...formData, [field]: value };
    setFormData(newData);
    onUpdateNode(selectedNode.id, newData);
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <div className="flex items-center gap-2 mb-6">
        <Icon className={colorClass} size={24} />
        <h2 className="font-semibold text-gray-800">
          Configure: {selectedNode.data.type.charAt(0).toUpperCase() + selectedNode.data.type.slice(1)} Node
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title
          </label>
          <input
            type="text"
            value={formData.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selectedNode.data.type === 'task' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignee
              </label>
              <input
                type="text"
                value={formData.assignee || ''}
                onChange={(e) => handleChange('assignee', e.target.value)}
                placeholder="e.g., HR Team"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </>
        )}

        {selectedNode.data.type === 'approval' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approver Role
              </label>
              <select
                value={formData.approver || ''}
                onChange={(e) => handleChange('approver', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select role...</option>
                <option value="Manager">Manager</option>
                <option value="HR Director">HR Director</option>
                <option value="Department Head">Department Head</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Approval Threshold: {formData.threshold || 0}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.threshold || 0}
                onChange={(e) => handleChange('threshold', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </>
        )}

        {selectedNode.data.type === 'automated' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Action
              {loading && <Loader2 className="inline ml-2 animate-spin" size={14} />}
            </label>
            <select
              value={formData.action || ''}
              onChange={(e) => handleChange('action', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <option value="">Select action...</option>
              {automations.map((automation) => (
                <option key={automation.id} value={`${automation.method} ${automation.endpoint}`}>
                  {automation.name} ({automation.method} {automation.endpoint})
                </option>
              ))}
            </select>
            {formData.action && (
              <div className="mt-2 text-xs text-gray-600">
                {automations.find(a => `${a.method} ${a.endpoint}` === formData.action)?.description}
              </div>
            )}
          </div>
        )}
        <div className="space-y-4">

          {/* Existing fields */}
          Title
          Description
          Task / Approval / Automated fields

          ✅ 👉 ADD HERE 👇

          {/* Custom Fields */}
          {(selectedNode.data.type === 'task' || selectedNode.data.type === 'approval') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Fields
              </label>

              <div className="space-y-2">
                {(formData.customFields || []).map((field, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Key"
                      value={field.key}
                      onChange={(e) => handleCustomFieldChange(index, 'key', e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      value={field.value}
                      onChange={(e) => handleCustomFieldChange(index, 'value', e.target.value)}
                      className="w-1/2 px-2 py-1 border rounded"
                    />
                    <button
                      onClick={() => removeCustomField(index)}
                      className="text-red-500 px-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addCustomField}
                className="mt-2 text-sm text-blue-600 hover:underline"
              >
                + Add Field
              </button>
            </div>
          )}


          <div className={`mt-6 h-1 rounded ...`} />



        </div>
        <div className={`mt-6 h-1 rounded ${selectedNode.data.type === 'start' ? 'bg-blue-500' : selectedNode.data.type === 'task' ? 'bg-orange-500' : selectedNode.data.type === 'approval' ? 'bg-purple-500' : selectedNode.data.type === 'automated' ? 'bg-green-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}
