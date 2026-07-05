import { useDroppable } from '@dnd-kit/core';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

export const DroppableSprint = ({
  sprintId,
  title,
  count,
  isActive,
  isCompleted,
  menuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  children,
}: {
  sprintId: string;
  title: string;
  count: number;
  isActive?: boolean;
  isCompleted?: boolean;
  menuOpen?: boolean;
  onToggleMenu?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  children: ReactNode;
}) => {
  const { isOver, setNodeRef } = useDroppable({ id: sprintId });

  return (
    <div 
      ref={setNodeRef}
      className={`rounded bg-[#f7f8f9] transition-colors ${isOver ? 'ring-2 ring-primary' : ''}`}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4 rounded border-[#8590a2]" />
          <h3 className={`text-sm font-semibold text-[#172b4d] ${isCompleted ? 'line-through text-[#626f86]' : ''}`}>
            {title}
          </h3>
          <span className="text-sm text-[#626f86]">({count} work items)</span>
        </div>
        <div className="flex items-center gap-2">
        {isActive === false && onStart && (
          <button onClick={onStart} className="h-8 rounded border border-[#dfe1e6] bg-white px-3 text-sm font-medium hover:bg-[#f1f2f4]">
            Start Sprint
          </button>
        )}
        {isActive === true && onComplete && (
          <button onClick={onComplete} className="h-8 rounded border border-[#dfe1e6] bg-white px-3 text-sm font-medium hover:bg-[#f1f2f4]">
            Complete Sprint
          </button>
        )}
          <div className="relative">
          <button
            onClick={onToggleMenu}
            className="grid h-8 w-8 place-items-center rounded hover:bg-[#ebecf0]"
            aria-label="More"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-20 w-36 rounded border border-[#dfe1e6] bg-white py-1 text-sm shadow-lg">
              <button onClick={onEdit} className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#f1f2f4]">
                <Pencil className="h-4 w-4" />
                Edit sprint
              </button>
              <button onClick={onDelete} className="flex w-full items-center gap-2 px-3 py-2 text-left text-[#ae2a19] hover:bg-[#ffebe6]">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
      <div className="min-h-[46px] border border-[#dfe1e6] bg-white">
        {children}
      </div>
    </div>
  );
};
