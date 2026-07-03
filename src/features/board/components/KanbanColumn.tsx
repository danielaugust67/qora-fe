import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task } from '@/features/task/types';
import { KanbanCard } from './KanbanCard';

interface ColumnProps {
  column: { id: string; title: string };
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}

export const KanbanColumn: React.FC<ColumnProps> = ({ column, tasks, onTaskClick }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div className="flex w-[272px] flex-shrink-0 flex-col rounded bg-[#f7f8f9]">
      <div className="flex h-11 items-center gap-2 px-4">
        <h3 className="text-xs font-semibold uppercase tracking-normal text-[#172b4d]">{column.title}</h3>
        <span className="rounded bg-[#dfe1e6] px-1.5 py-0.5 text-xs font-semibold text-[#44546f]">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`min-h-[220px] flex-1 overflow-y-auto px-2 pb-3 transition-colors ${
          isOver ? 'bg-[#e9f2ff]' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
