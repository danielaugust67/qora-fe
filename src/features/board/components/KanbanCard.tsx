import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/features/task/types';

interface CardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-blue-100 text-blue-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

const typeColors: Record<string, string> = {
  EPIC: 'bg-purple-100 text-purple-800',
  STORY: 'bg-green-100 text-green-800',
  TASK: 'bg-gray-100 text-gray-800',
  BUG: 'bg-red-100 text-red-800',
};

export const KanbanCard: React.FC<CardProps> = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: task });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`p-4 bg-card rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${
        isDragging ? 'opacity-50 border-dashed border-2' : ''
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${typeColors[task.type] || typeColors.TASK}`}>
          {task.type}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
          {task.priority}
        </span>
      </div>
      <h4 className="font-semibold text-sm leading-tight text-card-foreground">
        {task.title}
      </h4>
    </div>
  );
};
