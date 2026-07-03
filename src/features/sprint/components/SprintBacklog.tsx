import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { Task } from '@/features/task/types';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { Filter, MoreHorizontal, Pencil, Plus, Search, SlidersHorizontal, Trash2, X } from 'lucide-react';

interface TaskDraft {
  title: string;
  description: string;
  type: string;
  priority: string;
}

interface SprintDraft {
  name: string;
  goal: string;
}

const emptyTaskDraft: TaskDraft = {
  title: '',
  description: '',
  type: 'TASK',
  priority: 'MEDIUM',
};

const taskToDraft = (task: Task): TaskDraft => ({
  title: task.title,
  description: task.description || '',
  type: task.type || 'TASK',
  priority: task.priority || 'MEDIUM',
});

const sprintToDraft = (sprint: { name: string; goal?: string }): SprintDraft => ({
  name: sprint.name,
  goal: sprint.goal || '',
});

// Draggable Task Item
const DraggableTask = ({
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

const TaskInlineForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
}: {
  value: TaskDraft;
  onChange: (value: TaskDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isPending: boolean;
}) => {
  return (
    <div className="border-b border-[#dfe1e6] bg-white p-3">
      <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_auto]">
        <input
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
          placeholder="What needs to be done?"
        />
        <select
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-2 text-sm"
        >
          <option value="TASK">Task</option>
          <option value="STORY">Story</option>
          <option value="BUG">Bug</option>
          <option value="EPIC">Epic</option>
        </select>
        <select
          value={value.priority}
          onChange={(event) => onChange({ ...value, priority: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-2 text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.title.trim() || isPending}
            className="h-9 rounded bg-[#0c66e4] px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 place-items-center rounded hover:bg-[#f1f2f4]"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <textarea
        value={value.description}
        onChange={(event) => onChange({ ...value, description: event.target.value })}
        className="mt-3 min-h-[70px] w-full rounded border border-[#dfe1e6] p-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
        placeholder="Description"
      />
    </div>
  );
};

// Droppable Sprint Container
const SprintInlineForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
}: {
  value: SprintDraft;
  onChange: (value: SprintDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isPending: boolean;
}) => {
  return (
    <div className="mb-4 rounded border border-[#dfe1e6] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Sprint name"
          className="h-9 flex-1 rounded border border-[#dfe1e6] px-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
        />
        <button
          onClick={onSubmit}
          disabled={!value.name.trim() || isPending}
          className="h-9 rounded bg-[#0c66e4] px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <button onClick={onCancel} className="h-9 px-3 text-sm font-medium">
          Cancel
        </button>
      </div>
      <textarea
        value={value.goal}
        onChange={(event) => onChange({ ...value, goal: event.target.value })}
        placeholder="Sprint goal"
        className="mt-3 min-h-[70px] w-full rounded border border-[#dfe1e6] p-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
      />
    </div>
  );
};

const DroppableSprint = ({
  sprintId,
  title,
  count,
  isActive,
  menuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
  onStart,
  onComplete,
  children,
}: any) => {
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

export const SprintBacklog = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprint, setNewSprint] = useState<SprintDraft>({ name: '', goal: '' });
  const [editingSprintId, setEditingSprintId] = useState<string | null>(null);
  const [editingSprint, setEditingSprint] = useState<SprintDraft>({ name: '', goal: '' });
  const [openSprintMenuId, setOpenSprintMenuId] = useState<string | null>(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [newTask, setNewTask] = useState<TaskDraft>(emptyTaskDraft);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskDraft>(emptyTaskDraft);

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
    mutationFn: (data: SprintDraft) => sprintApi.createSprint(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      setIsCreatingSprint(false);
      setNewSprint({ name: '', goal: '' });
    }
  });

  const updateSprintMutation = useMutation({
    mutationFn: ({ sprintId, data }: { sprintId: string; data: SprintDraft }) =>
      sprintApi.updateSprint(sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      setEditingSprintId(null);
      setEditingSprint({ name: '', goal: '' });
      setOpenSprintMenuId(null);
    },
  });

  const deleteSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.deleteSprint(sprintId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setOpenSprintMenuId(null);
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: TaskDraft) => taskApi.createTask(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setIsCreatingTask(false);
      setNewTask(emptyTaskDraft);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, data }: { taskId: string; data: TaskDraft }) => taskApi.updateTask(taskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      setEditingTaskId(null);
      setEditingTask(emptyTaskDraft);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => taskApi.deleteTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    },
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
  const startEditingSprint = (sprint: { id: string; name: string; goal?: string }) => {
    setEditingSprintId(sprint.id);
    setEditingSprint(sprintToDraft(sprint));
    setOpenSprintMenuId(null);
    setIsCreatingSprint(false);
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTask(taskToDraft(task));
    setIsCreatingTask(false);
  };

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
              onClick={() => {
                setIsCreatingSprint(true);
                setEditingSprintId(null);
                setOpenSprintMenuId(null);
              }}
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
        <SprintInlineForm
          value={newSprint}
          onChange={setNewSprint}
          onSubmit={() => createSprintMutation.mutate(newSprint)}
          onCancel={() => {
            setIsCreatingSprint(false);
            setNewSprint({ name: '', goal: '' });
          }}
          submitLabel="Save sprint"
          isPending={createSprintMutation.isPending}
        />
      )}

      <DndContext onDragEnd={handleDragEnd}>
        {/* Sprints */}
        <div className="space-y-4">
          {plannedSprints.map(sprint => (
            <div key={sprint.id} className="space-y-2">
            {editingSprintId === sprint.id && (
              <SprintInlineForm
                value={editingSprint}
                onChange={setEditingSprint}
                onSubmit={() => updateSprintMutation.mutate({ sprintId: sprint.id, data: editingSprint })}
                onCancel={() => {
                  setEditingSprintId(null);
                  setEditingSprint({ name: '', goal: '' });
                }}
                submitLabel="Save sprint"
                isPending={updateSprintMutation.isPending}
              />
            )}
            <DroppableSprint 
              sprintId={sprint.id} 
              title={`${sprint.name} ${sprint.status === 'ACTIVE' ? '(active)' : ''}`}
              count={tasks.filter(t => t.sprint_id === sprint.id).length}
              isActive={sprint.status === 'ACTIVE'}
              menuOpen={openSprintMenuId === sprint.id}
              onToggleMenu={() => setOpenSprintMenuId((current) => current === sprint.id ? null : sprint.id)}
              onEdit={() => startEditingSprint(sprint)}
              onDelete={() => deleteSprintMutation.mutate(sprint.id)}
              onStart={sprint.status === 'PLANNED' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'ACTIVE' }) : undefined}
              onComplete={sprint.status === 'ACTIVE' ? () => updateSprintStatusMutation.mutate({ sprintId: sprint.id, status: 'COMPLETED' }) : undefined}
            >
              {tasks.filter(t => t.sprint_id === sprint.id).length === 0 ? (
                <div className="p-4 text-center text-sm text-[#626f86]">
                  Drag tasks here to plan this sprint.
                </div>
              ) : (
                tasks.filter(t => t.sprint_id === sprint.id).map(task => (
                  editingTaskId === task.id ? (
                    <TaskInlineForm
                      key={task.id}
                      value={editingTask}
                      onChange={setEditingTask}
                      onSubmit={() => updateTaskMutation.mutate({ taskId: task.id, data: editingTask })}
                      onCancel={() => {
                        setEditingTaskId(null);
                        setEditingTask(emptyTaskDraft);
                      }}
                      submitLabel="Save"
                      isPending={updateTaskMutation.isPending}
                    />
                  ) : (
                    <DraggableTask
                      key={task.id}
                      task={task}
                      onEdit={() => startEditingTask(task)}
                      onDelete={() => deleteTaskMutation.mutate(task.id)}
                    />
                  )
                ))
              )}
            </DroppableSprint>
            </div>
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
                editingTaskId === task.id ? (
                  <TaskInlineForm
                    key={task.id}
                    value={editingTask}
                    onChange={setEditingTask}
                    onSubmit={() => updateTaskMutation.mutate({ taskId: task.id, data: editingTask })}
                    onCancel={() => {
                      setEditingTaskId(null);
                      setEditingTask(emptyTaskDraft);
                    }}
                    submitLabel="Save"
                    isPending={updateTaskMutation.isPending}
                  />
                ) : (
                  <DraggableTask
                    key={task.id}
                    task={task}
                    onEdit={() => startEditingTask(task)}
                    onDelete={() => deleteTaskMutation.mutate(task.id)}
                  />
                )
              ))
            )}
            {isCreatingTask ? (
              <TaskInlineForm
                value={newTask}
                onChange={setNewTask}
                onSubmit={() => createTaskMutation.mutate(newTask)}
                onCancel={() => {
                  setIsCreatingTask(false);
                  setNewTask(emptyTaskDraft);
                }}
                submitLabel="Create"
                isPending={createTaskMutation.isPending}
              />
            ) : (
              <button
                onClick={() => {
                  setIsCreatingTask(true);
                  setEditingTaskId(null);
                }}
                className="flex h-10 w-full items-center gap-2 px-4 text-left text-sm text-[#44546f] hover:bg-[#f1f2f4]"
              >
                <Plus className="h-4 w-4" />
                Create
              </button>
            )}
          </DroppableSprint>
        </div>
      </DndContext>
      </div>
    </ProjectChrome>
  );
};
