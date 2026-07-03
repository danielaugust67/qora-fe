import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { Task } from '@/features/task/types';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';

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
      className={`p-3 bg-card border rounded-md shadow-sm flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${isDragging ? 'opacity-50 z-50 relative' : ''}`}
    >
      <div className="font-medium text-sm">{task.title}</div>
      <span className="text-xs bg-muted px-2 py-1 rounded">{task.type}</span>
    </div>
  );
};

// Droppable Sprint Container
const DroppableSprint = ({ sprintId, title, isActive, onStart, onComplete, children }: any) => {
  const { isOver, setNodeRef } = useDroppable({ id: sprintId });

  return (
    <div 
      ref={setNodeRef}
      className={`border-2 rounded-xl p-4 bg-muted/20 transition-colors ${isOver ? 'border-primary/50 bg-primary/5' : 'border-dashed'}`}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">{title}</h3>
        {isActive === false && onStart && (
          <button onClick={onStart} className="text-xs font-semibold bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:bg-primary/90">
            Start Sprint
          </button>
        )}
        {isActive === true && onComplete && (
          <button onClick={onComplete} className="text-xs font-semibold bg-emerald-600 text-white px-3 py-1.5 rounded-md hover:bg-emerald-700">
            Complete Sprint
          </button>
        )}
      </div>
      <div className="space-y-2 min-h-[100px]">
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
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Backlog</h2>
        <div className="flex gap-4">
          <Link to={`/projects/${projectId}/board`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md font-medium text-sm border hover:bg-secondary/80">
            Go to Active Board
          </Link>
          <button 
            onClick={() => setIsCreatingSprint(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm"
          >
            Create Sprint
          </button>
        </div>
      </div>

      {isCreatingSprint && (
        <div className="p-4 bg-card border shadow-sm rounded-lg flex gap-4 items-center">
          <input 
            value={newSprintName}
            onChange={e => setNewSprintName(e.target.value)}
            placeholder="Sprint Name e.g. Sprint 1"
            className="flex-1 h-10 px-3 rounded-md border text-sm"
          />
          <button 
            onClick={() => createSprintMutation.mutate(newSprintName)}
            disabled={!newSprintName.trim() || createSprintMutation.isPending}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
          >
            Save Sprint
          </button>
          <button onClick={() => setIsCreatingSprint(false)} className="text-sm font-medium px-4">Cancel</button>
        </div>
      )}

      <DndContext onDragEnd={handleDragEnd}>
        {/* Sprints */}
        <div className="space-y-6">
          {plannedSprints.map(sprint => (
            <DroppableSprint 
              key={sprint.id} 
              sprintId={sprint.id} 
              title={`${sprint.name} ${sprint.status === 'ACTIVE' ? '(ACTIVE)' : ''}`}
              isActive={sprint.status === 'ACTIVE'}
              onStart={sprint.status === 'PLANNED' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'ACTIVE' }) : undefined}
              onComplete={sprint.status === 'ACTIVE' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'COMPLETED' }) : undefined}
            >
              {tasks.filter(t => t.sprint_id === sprint.id).length === 0 ? (
                <div className="text-sm text-muted-foreground p-4 text-center border-dashed border rounded-md">
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
        <div className="mt-12">
          <DroppableSprint sprintId="backlog" title="Backlog (Unassigned Tasks)">
            {backlogTasks.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 text-center border-dashed border rounded-md">
                Your backlog is empty. Create some tasks in the Kanban board and clear their sprint!
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
  );
};
