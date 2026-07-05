import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/features/task/types';
import { motion } from 'framer-motion';

interface CardProps {
  task: Task;
  onClick?: () => void;
}

const priorityColors: Record<string, string> = {
  LOW: 'bg-[#e9f2ff] text-primary',
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
      className={`cursor-grab group transition-all active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <motion.div
        whileHover={{ y: -2 }}
        className={`linear-card p-3.5 relative overflow-hidden ${
          isDragging ? 'border-2 border-dashed border-primary shadow-none' : ''
        }`}
      >
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`text-[10px] font-bold tracking-wider rounded px-1.5 py-0.5 ${typeColors[task.type] || typeColors.TASK}`}>
              {task.type}
            </span>
            <span className="text-xs font-mono text-muted-foreground">
              {task.id.split('-')[0].toUpperCase()}-{task.id.substring(task.id.length - 4).toUpperCase()}
            </span>
          </div>
          <span className={`text-[10px] font-bold tracking-wider rounded px-1.5 py-0.5 ${priorityColors[task.priority] || priorityColors.MEDIUM}`}>
            {task.priority}
          </span>
        </div>
        
        <h4 className="text-[13px] font-medium leading-snug text-foreground mb-3 group-hover:text-primary transition-colors">
          {task.title}
        </h4>
        
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
          <div className="flex -space-x-1">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-[#5e6ad2] to-[#4d5ac4] text-[9px] font-bold text-white shadow-sm ring-1 ring-white dark:ring-black">
              D
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8 4.50001C8 4.22387 7.77614 4.00001 7.5 4.00001C7.22386 4.00001 7 4.22387 7 4.50001V7.50001C7 7.63262 7.05268 7.7598 7.14645 7.85356L9.14645 9.85356C9.34171 10.0488 9.65829 10.0488 9.85355 9.85356C10.0488 9.6583 10.0488 9.34172 9.85355 9.14646L8 7.2929V4.50001Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
            Aug 12
          </span>
        </div>
      </motion.div>
    </div>
  );
};
