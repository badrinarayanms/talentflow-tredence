import { Play, User, ShieldCheck, Settings, StopCircle } from 'lucide-react';
import type { NodeType } from './WorkflowNode';

const components = [
  { type: 'start', label: 'Start', icon: Play, color: 'text-blue-500' },
  { type: 'task', label: 'Task', icon: User, color: 'text-orange-500' },
  { type: 'approval', label: 'Approval', icon: ShieldCheck, color: 'text-purple-500' },
  { type: 'automated', label: 'Automated Step', icon: Settings, color: 'text-green-500' },
  { type: 'end', label: 'End', icon: StopCircle, color: 'text-red-500' },
];

// interface ComponentPaletteProps {
//   onAddNode: (type: NodeType) => void;
// }

export function ComponentPalette() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Components</h2>
      <div className="space-y-2">
        {components.map((component) => {
          const Icon = component.icon;
          return (
            <div
              key={component.type}
              draggable
              onDragStart={(event) => {
                event.dataTransfer.setData('application/reactflow', component.type);
                event.dataTransfer.effectAllowed = 'move';

                // 👇 Create small drag preview
                const dragPreview = document.createElement('div');
                dragPreview.style.width = '40px';
                dragPreview.style.height = '40px';
                dragPreview.style.borderRadius = '8px';
                dragPreview.style.background = '#3b82f6';
                dragPreview.style.opacity = '0.8';
                dragPreview.style.display = 'flex';
                dragPreview.style.alignItems = 'center';
                dragPreview.style.justifyContent = 'center';
                dragPreview.style.color = 'white';
                dragPreview.style.fontSize = '12px';
                dragPreview.innerText = component.label;

                document.body.appendChild(dragPreview);

                event.dataTransfer.setDragImage(dragPreview, 20, 20);

                // remove after render
                setTimeout(() => {
                  document.body.removeChild(dragPreview);
                }, 0);
              }}
              className="w-full flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-grab"
            >
              <Icon className={component.color} size={20} />
              <span className="text-sm font-medium text-gray-700">
                {component.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
