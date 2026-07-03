import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { Task } from '@/features/task/types';
import { KanbanColumn } from './KanbanColumn';
import { TaskDetailModal } from '@/features/task/components/TaskDetailModal';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanCard } from './KanbanCard';
import { useParams, Link } from 'react-router-dom';
import { sprintApi } from '@/features/sprint/api/sprintApi';

const COLUMNS = [
  { id: 'TODO', title: 'To Do' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'Review' },
  { id: 'TESTING', title: 'Testing' },
  { id: 'DONE', title: 'Done' },
];

export const KanbanBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: allTasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId!),
    enabled: !!projectId,
  });

  const { data: sprints = [], isLoading: sprintsLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints(projectId!),
    enabled: !!projectId,
  });

  const activeSprint = sprints.find((s) => s.status === 'ACTIVE');
  const tasks = activeSprint ? allTasks.filter((t) => t.sprint_id === activeSprint.id) : [];

  const updateTaskStatus = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) => 
      taskApi.updateStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    let newStatus = task.status;

    // If dropped on a column
    if (COLUMNS.find((col) => col.id === overId)) {
      newStatus = overId;
    } else {
      // If dropped on another card
      const overTask = tasks.find((t) => t.id === overId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (task.status !== newStatus) {
      // Optimistic update locally
      queryClient.setQueryData(['tasks', projectId], (old: Task[]) =>
        old.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
      updateTaskStatus.mutate({ taskId, status: newStatus });
    }
  };

  if (tasksLoading || sprintsLoading) return <div className="p-8 text-muted-foreground">Loading board...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:underline text-muted-foreground">
            &larr; Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold">Kanban Board {activeSprint && `- ${activeSprint.name}`}</h2>
        </div>
        <div className="flex gap-4">
          <Link to={`/projects/${projectId}/backlog`} className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md text-sm font-medium border hover:bg-secondary/80">
            Sprint Planning (Backlog)
          </Link>
          {activeSprint && (
            <button
              onClick={() => setSelectedTask({ sprint_id: activeSprint.id } as Task)} // signify creation
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium"
            >
              Add Task
            </button>
          )}
        </div>
      </div>

      {!activeSprint ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl">
          <h3 className="text-xl font-bold mb-2">No Active Sprint</h3>
          <p className="text-muted-foreground mb-6">Start a sprint from the backlog to see tasks on the board.</p>
          <Link to={`/projects/${projectId}/backlog`} className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium text-sm">
            Go to Backlog
          </Link>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 overflow-x-auto pb-4 h-full">
            {COLUMNS.map((col) => (
            <KanbanColumn 
              key={col.id} 
              column={col} 
              tasks={tasks.filter((t) => t.status === col.id)}
              onTaskClick={(task) => setSelectedTask(task)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          projectId={projectId!}
          onClose={() => setSelectedTask(null)} 
        />
      )}
    </div>
  );
};
