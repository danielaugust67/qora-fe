import { useState } from 'react';
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
import { useParams } from 'react-router-dom';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { Filter, Group, MoreHorizontal, Search, SlidersHorizontal } from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'Idea' },
  { id: 'IN_PROGRESS', title: 'In Progress' },
  { id: 'REVIEW', title: 'In Review' },
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

  if (tasksLoading || sprintsLoading) {
    return (
      <ProjectChrome projectId={projectId!}>
        <div className="p-8 text-sm text-[#626f86]">Loading board...</div>
      </ProjectChrome>
    );
  }

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="flex h-[calc(100vh-10rem)] flex-col bg-white px-8 py-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626f86]" />
              <input
                className="h-9 w-48 rounded border border-[#dfe1e6] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
                placeholder="Search board"
              />
            </div>
            <div className="grid h-8 w-8 place-items-center rounded-full bg-[#00875a] text-xs font-bold text-white">D</div>
            <button className="inline-flex h-9 items-center gap-2 rounded border border-[#dfe1e6] bg-white px-3 text-sm text-[#172b4d] hover:bg-[#f1f2f4]">
              <Filter className="h-4 w-4" />
              Filter
            </button>
          </div>

          <div className="flex items-center gap-2">
          {activeSprint && (
            <button
              className="h-9 rounded bg-[#0c66e4] px-4 text-sm font-semibold text-white hover:bg-[#0055cc]"
            >
              Complete sprint
            </button>
          )}
            <button className="grid h-9 w-9 place-items-center rounded border border-[#dfe1e6] bg-white hover:bg-[#f1f2f4]" aria-label="Group">
              <Group className="h-4 w-4" />
            </button>
            <button className="inline-flex h-9 items-center gap-2 rounded border border-[#dfe1e6] bg-white px-3 text-sm hover:bg-[#f1f2f4]">
              Group
            </button>
            <button className="grid h-9 w-9 place-items-center rounded border border-[#dfe1e6] bg-white hover:bg-[#f1f2f4]" aria-label="View settings">
              <SlidersHorizontal className="h-4 w-4" />
            </button>
            <button className="grid h-9 w-9 place-items-center rounded border border-[#dfe1e6] bg-white hover:bg-[#f1f2f4]" aria-label="More">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        </div>

      {!activeSprint ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded bg-[#f7f8f9] text-center">
          <h3 className="mb-2 text-lg font-semibold">No active sprint</h3>
          <p className="text-sm text-[#626f86]">Start a sprint from the backlog to see tasks on the board.</p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full gap-3 overflow-x-auto pb-3">
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
    </ProjectChrome>
  );
};
