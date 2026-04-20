import { Handle, Position } from '@xyflow/react';
import { Play, User, ShieldCheck, Settings, StopCircle } from 'lucide-react';

export type NodeType = 'start' | 'task' | 'approval' | 'automated' | 'end';

export interface WorkflowNodeData extends Record<string, unknown> {
  [key: string]: unknown;
  label: string;
  type: NodeType;

  assignee?: string;
  approver?: string;
  action?: string;
  description?: string;
  dueDate?: string;
  threshold?: number;

  customFields?: { key: string; value: string }[]; // ✅ ADD THIS
}

interface WorkflowNodeProps {
  data: WorkflowNodeData;
  selected?: boolean;
}

const nodeConfig = {
  start: {
    color: 'rgb(59, 130, 246)',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-500',
    icon: Play,
    label: 'Start'
  },
  task: {
    color: 'rgb(249, 115, 22)',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-500',
    icon: User,
    label: 'Task'
  },
  approval: {
    color: 'rgb(168, 85, 247)',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-500',
    icon: ShieldCheck,
    label: 'Approval'
  },
  automated: {
    color: 'rgb(34, 197, 94)',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-500',
    icon: Settings,
    label: 'Automated Step'
  },
  end: {
    color: 'rgb(239, 68, 68)',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-500',
    icon: StopCircle,
    label: 'End'
  }
};

export function WorkflowNode({ data, selected }: WorkflowNodeProps) {
  const config = nodeConfig[data.type];
  const Icon = config.icon;

  return (
    <div className={`relative ${config.bgColor} border-2 ${config.borderColor} rounded-md p-2 min-w-[140px] shadow ${selected ? 'ring-2 ring-blue-300' : ''}`}>
      {data.type !== 'start' && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 rounded-full border-2 border-white shadow-lg"
          style={{ background: config.color }}
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <Icon size={20} style={{ color: config.color }} />
        <span className="font-semibold" style={{ color: config.color }}>
          {config.label}
        </span>
      </div>

      <div className="text-sm font-medium text-gray-800 mb-1">{data.label}</div>

      {data.assignee && (
        <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-2">
          Assignee: {data.assignee}
        </div>
      )}

      {data.approver && (
        <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-2">
          Approver: {data.approver}
        </div>
      )}

      {data.action && (
        <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-2">
          {data.action}
        </div>
      )}
      {data.action && (
        <div className="text-xs text-gray-600 bg-white px-2 py-1 rounded mt-2">
          {data.action}
        </div>
      )}


      {data.customFields && data.customFields.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.customFields.map((field, index) => (
            <div key={index} className="text-xs text-gray-600 bg-white px-2 py-1 rounded">
              {field.key}: {field.value}
            </div>
          ))}
        </div>
      )}

      <div
        className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
        style={{ backgroundColor: config.color }}
      />

      {data.type !== 'end' && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-3 !h-3 rounded-full border-2 border-white shadow-lg"
          style={{ background: config.color }}
        />
      )}
    </div>
  );
}
