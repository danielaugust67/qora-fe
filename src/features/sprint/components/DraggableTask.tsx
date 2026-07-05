import { Task } from '@/features/task/types';
import { useDraggable } from '@dnd-kit/core';
import { Pencil, Trash2 } from 'lucide-react';

export const DraggableTask = ({
  task,
  onEdit,
  onDelete,
}: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: task,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`grid cursor-grab grid-cols-[92px_1fr_180px_92px_56px_72px] items-center border-b border-[#dfe1e6] bg-white px-3 py-2 text-sm active:cursor-grabbing ${isDragging ? 'relative z-50 opacity-50' : ''}`}
    >
      <div className="text-[#44546f] line-through decoration-[#44546f]">{task.id.split('-')[0].toUpperCase()}</div>
      <div className="font-medium text-[#172b4d]">{task.title}</div>
      <span className="w-fit rounded bg-[#dfd8fd] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#5e4db2]">
        {task.type}
      </span>
      <span className="w-fit rounded bg-[#dfe1e6] px-1.5 py-0.5 text-[11px] font-bold uppercase text-[#44546f]">
        {task.status.replace('_', ' ')}
      </span>
      <span className="w-fit rounded bg-[#dfe1e6] px-2 py-0.5 text-xs font-semibold text-[#44546f]">{task.priority}</span>
      <div className="flex items-center justify-end gap-1">
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onEdit();
          }}
          className="grid h-7 w-7 place-items-center rounded hover:bg-[#f1f2f4]"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onDelete();
          }}
          className="grid h-7 w-7 place-items-center rounded text-[#ae2a19] hover:bg-[#ffebe6]"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
