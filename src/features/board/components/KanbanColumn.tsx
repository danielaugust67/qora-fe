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
    <div className="flex flex-col flex-shrink-0 w-80 bg-muted/40 rounded-xl">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="font-semibold text-sm tracking-tight">{column.title}</h3>
        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>
      
      <div
        ref={setNodeRef}
        className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors ${
          isOver ? 'bg-primary/5' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
};
