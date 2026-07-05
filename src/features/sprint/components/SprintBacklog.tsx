import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { Task } from '@/features/task/types';
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { Filter, Search, SlidersHorizontal, Plus, MoreHorizontal } from 'lucide-react';
import { TaskDraft, SprintDraft } from '../types';
import { DraggableTask } from './DraggableTask';
import { DroppableSprint } from './DroppableSprint';
import { TaskInlineForm } from './TaskForm';
import { SprintInlineForm } from './SprintForm';

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
      sprintApi.updateSprint(projectId!, sprintId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      setEditingSprintId(null);
      setEditingSprint({ name: '', goal: '' });
      setOpenSprintMenuId(null);
    },
  });

  const deleteSprintMutation = useMutation({
    mutationFn: (sprintId: string) => sprintApi.deleteSprint(projectId!, sprintId),
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
                className="h-9 w-48 rounded border border-[#dfe1e6] bg-white pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
              className="h-9 rounded bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90"
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
          {sprints.map(sprint => (
            <div key={sprint.id} className={`space-y-2 ${sprint.status === 'COMPLETED' ? 'opacity-70' : ''}`}>
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
              title={`${sprint.name} ${sprint.status === 'ACTIVE' ? '(active)' : sprint.status === 'COMPLETED' ? '(completed)' : ''}`}
              count={tasks.filter(t => t.sprint_id === sprint.id).length}
              isActive={sprint.status === 'ACTIVE'}
              isCompleted={sprint.status === 'COMPLETED'}
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
