import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { Task } from '@/features/task/types';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { Filter, MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react';

// Draggable Task Item
const DraggableTask = ({ task }: { task: Task }) => {
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
      className={`grid cursor-grab grid-cols-[92px_1fr_180px_92px_56px_32px] items-center border-b border-[#dfe1e6] bg-white px-3 py-2 text-sm active:cursor-grabbing ${isDragging ? 'relative z-50 opacity-50' : ''}`}
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
      <span className="grid h-6 w-6 place-items-center rounded-full bg-[#00875a] text-xs font-bold text-white">D</span>
    </div>
  );
};

// Droppable Sprint Container
const DroppableSprint = ({ sprintId, title, count, isActive, onStart, onComplete, children }: any) => {
  const { isOver, setNodeRef } = useDroppable({ id: sprintId });

  return (
    <div 
      ref={setNodeRef}
      className={`rounded bg-[#f7f8f9] transition-colors ${isOver ? 'ring-2 ring-[#0c66e4]' : ''}`}
    >
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <input type="checkbox" className="h-4 w-4 rounded border-[#8590a2]" />
          <h3 className="text-sm font-semibold text-[#172b4d]">{title}</h3>
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
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#ebecf0]" aria-label="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="min-h-[46px] border border-[#dfe1e6] bg-white">
        {children}
      </div>
    </div>
  );
};

export const SprintBacklog = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId!),
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints(projectId!),
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({ taskId, sprintId }: { taskId: string; sprintId: string | null }) => 
      sprintApi.assignTaskToSprint(taskId, sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const createSprintMutation = useMutation({
    mutationFn: (name: string) => sprintApi.createSprint(projectId!, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      setIsCreatingSprint(false);
      setNewSprintName('');
    }
  });

  const updateSprintStatusMutation = useMutation({
    mutationFn: ({ sprintId, status }: { sprintId: string; status: string }) => 
      sprintApi.updateStatus(projectId!, sprintId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    }
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const sprintId = over.id as string; // 'backlog' or uuid

    const targetSprintId = sprintId === 'backlog' ? null : sprintId;
    
    const task = tasks.find(t => t.id === taskId);
    if (task?.sprint_id !== targetSprintId) {
      assignTaskMutation.mutate({ taskId, sprintId: targetSprintId });
      
      // Optimistic
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) => 
        old.map(t => t.id === taskId ? { ...t, sprint_id: targetSprintId } : t)
      );
    }
  };

  const backlogTasks = tasks.filter(t => !t.sprint_id);
  const plannedSprints = sprints.filter(s => s.status === 'PLANNED' || s.status === 'ACTIVE');

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="bg-white px-8 py-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626f86]" />
              <input
                className="h-9 w-48 rounded border border-[#dfe1e6] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
                placeholder="Search backlog"
              />
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#00875a] text-xs font-bold text-white">D</div>
            <button className="inline-flex h-9 items-center gap-2 rounded border border-[#dfe1e6] bg-white px-3 text-sm hover:bg-[#f1f2f4]">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreatingSprint(true)}
              className="h-9 rounded bg-[#0c66e4] px-4 text-sm font-semibold text-white hover:bg-[#0055cc]"
            >
              Create sprint
            </button>
            <button className="grid h-9 w-9 place-items-center rounded border border-[#dfe1e6] bg-white hover:bg-[#f1f2f4]" aria-label="View">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded border border-[#dfe1e6] bg-white hover:bg-[#f1f2f4]" aria-label="More">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

      {isCreatingSprint && (
        <div className="mb-4 flex items-center gap-3 rounded border border-[#dfe1e6] bg-white p-3 shadow-sm">
          <input 
            value={newSprintName}
            onChange={e => setNewSprintName(e.target.value)}
            placeholder="Sprint Name e.g. Sprint 1"
            className="h-9 flex-1 rounded border border-[#dfe1e6] px-3 text-sm"
          />
          <button 
            onClick={() => createSprintMutation.mutate(newSprintName)}
            disabled={!newSprintName.trim() || createSprintMutation.isPending}
            className="h-9 rounded bg-[#0c66e4] px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save Sprint
          </button>
          <button onClick={() => setIsCreatingSprint(false)} className="h-9 px-3 text-sm font-medium">Cancel</button>
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        {/* Sprints */}
        <div className="space-y-4">
          {plannedSprints.map(sprint => (
            <DroppableSprint 
              key={sprint.id} 
              sprintId={sprint.id} 
              title={`${sprint.name} ${sprint.status === 'ACTIVE' ? '(active)' : ''}`}
              count={tasks.filter(t => t.sprint_id === sprint.id).length}
              isActive={sprint.status === 'ACTIVE'}
              onStart={sprint.status === 'PLANNED' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'ACTIVE' }) : undefined}
              onComplete={sprint.status === 'ACTIVE' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'COMPLETED' }) : undefined}
            >
              {tasks.filter(t => t.sprint_id === sprint.id).length === 0 ? (
                <div className="p-4 text-center text-sm text-[#626f86]">
                  Drag tasks here to plan this sprint.
                </div>
              ) : (
                tasks.filter(t => t.sprint_id === sprint.id).map(task => (
                  <DraggableTask key={task.id} task={task} />
                ))
              )}
            </DroppableSprint>
          ))}
        </div>

        {/* Backlog */}
        <div className="mt-4">
          <DroppableSprint sprintId="backlog" title="Backlog" count={backlogTasks.length}>
            {backlogTasks.length === 0 ? (
              <div className="p-4 text-center text-sm text-[#626f86]">
                Your backlog is empty.
              </div>
            ) : (
              backlogTasks.map(task => (
                <DraggableTask key={task.id} task={task} />
              ))
            )}
          </DroppableSprint>
        </div>
      </DndContext>
      </div>
    </ProjectChrome>
  );
};
