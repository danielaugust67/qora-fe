import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/features/task/types';

interface CardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-[#e9f2ff] text-[#0c66e4]',
  MEDIUM: 'bg-[#dfe1e6] text-[#44546f]',
  HIGH: 'bg-[#fff7d6] text-[#7f5f01]',
  URGENT: 'bg-[#ffebe6] text-[#ae2a19]',
  CRITICAL: 'bg-[#ffebe6] text-[#ae2a19]',
};

const typeColors: Record<string, string> = {
  EPIC: 'bg-[#dfd8fd] text-[#5e4db2]',
  STORY: 'bg-[#dcfff1] text-[#216e4e]',
  TASK: 'bg-[#dfe1e6] text-[#44546f]',
  BUG: 'bg-[#ffebe6] text-[#ae2a19]',
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
      className={`cursor-grab rounded border border-[#dfe1e6] bg-white p-3 shadow-[0_1px_1px_rgba(9,30,66,0.16)] transition-colors hover:border-[#0c66e4] active:cursor-grabbing ${
        isDragging ? 'border-2 border-dashed opacity-50' : ''
      }`}
    >
      <h4 className="mb-3 text-sm font-medium leading-5 text-[#172b4d]">
        {task.title}
      </h4>
      <div className="mb-3 flex items-center gap-2">
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${typeColors[task.type] || typeColors.TASK}`}>
          {task.type}
        </span>
        <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold uppercase ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
          {task.priority}
        </span>
      </div>
      <div className="flex items-center justify-between text-xs text-[#44546f]">
        <span>{task.id.split('-')[0].toUpperCase()}</span>
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00875a] text-[11px] font-bold text-white">D</span>
      </div>
    </div>
  );
};
