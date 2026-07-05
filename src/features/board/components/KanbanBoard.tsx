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
import { Filter, Group, MoreHorizontal, Plus, Search, SlidersHorizontal } from 'lucide-react';
import { useWebSocket } from '@/hooks/useWebSocket';

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

  const [filterSearch, setFilterSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);

  useWebSocket(projectId!);

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
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="h-9 w-48 rounded border border-[#dfe1e6] bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Search board"
              />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setFilterOpen(!filterOpen)}
                className={`inline-flex h-9 items-center gap-2 rounded border px-3 text-sm transition-colors ${filterPriority || filterType ? 'border-primary bg-primary/10 text-primary hover:bg-primary/20' : 'border-[#dfe1e6] bg-white text-[#172b4d] hover:bg-[#f1f2f4]'}`}
              >
                <Filter className="h-4 w-4" />
                Filter {(filterPriority || filterType) && '(Active)'}
              </button>
              {filterOpen && (
                <div className="absolute left-0 top-11 z-40 w-64 rounded-xl border border-white/20 glass p-4 text-sm shadow-2xl">
                  <div className="mb-3 font-semibold text-foreground">Filters</div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Priority</label>
                      <select 
                        value={filterPriority} 
                        onChange={(e) => setFilterPriority(e.target.value)}
                        className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="">All Priorities</option>
                        <option value="HIGH">High</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="LOW">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Type</label>
                      <select 
                        value={filterType} 
                        onChange={(e) => setFilterType(e.target.value)}
                        className="w-full h-8 rounded-md border border-border bg-background px-2 text-xs"
                      >
                        <option value="">All Types</option>
                        <option value="BUG">Bug</option>
                        <option value="TASK">Task</option>
                        <option value="EPIC">Epic</option>
                      </select>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <button 
                        onClick={() => { setFilterPriority(''); setFilterType(''); }}
                        className="text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
          {activeSprint && (
            <button
              className="h-9 rounded bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
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
        <div className="flex h-[calc(100vh-160px)] gap-6 overflow-x-auto pb-4 px-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {COLUMNS.map((column) => {
            const columnTasks = tasks.filter((t) => {
              if (t.status !== column.id) return false;
              if (filterSearch && !t.title.toLowerCase().includes(filterSearch.toLowerCase())) return false;
              if (filterPriority && t.priority !== filterPriority) return false;
              if (filterType && t.type !== filterType) return false;
              return true;
            });
            return (
              <div key={column.id} className="flex h-full w-[320px] flex-shrink-0 flex-col rounded-xl bg-gray-50/50 border border-border/40 p-3 dark:bg-black/20 dark:border-white/5">
                <div className="mb-4 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    {column.title}
                    <span className="grid min-w-[20px] place-items-center rounded-full bg-border/60 px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">
                      {columnTasks.length}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <Plus className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <KanbanColumn id={column.id} tasks={columnTasks} onTaskClick={setSelectedTask} />
              </div>
            );
          })}

        <DragOverlay>
          {activeTask ? <KanbanCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
      </div>
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
