import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workspaceApi } from '../api/workspaceApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ProjectList } from '@/features/project/components/ProjectList';

const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createWorkspaceSchema>;

export const WorkspaceDashboard = () => {
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: workspaces, isLoading } = useQuery({
    queryKey: ['workspaces'],
    queryFn: workspaceApi.getWorkspaces,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFormValues>({
    resolver: zodResolver(createWorkspaceSchema),
  });

  const mutation = useMutation({
    mutationFn: workspaceApi.createWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] });
      setIsCreating(false);
      reset();
    },
  });

  const onSubmit = (data: CreateFormValues) => {
    mutation.mutate(data);
  };

  if (selectedWorkspaceId) {
    const ws = workspaces?.find((w) => w.id === selectedWorkspaceId);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setSelectedWorkspaceId(null)}
            className="text-sm font-medium hover:underline text-muted-foreground"
          >
            &larr; Back to Workspaces
          </button>
          <h2 className="text-2xl font-semibold tracking-tight">{ws?.name}</h2>
        </div>
        <ProjectList workspaceId={selectedWorkspaceId} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Workspaces</h2>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          {isCreating ? 'Cancel' : 'Create Workspace'}
        </button>
      </div>

      {isCreating && (
        <div className="p-6 bg-card rounded-xl border shadow-sm max-w-md mb-8">
          <h3 className="text-lg font-medium mb-4">New Workspace</h3>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                {...register('name')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="My Awesome Team"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="What is this workspace for?"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2"
            >
              {mutation.isPending ? 'Creating...' : 'Create'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div>Loading workspaces...</div>
      ) : workspaces?.length === 0 ? (
        <div className="text-center p-12 border rounded-xl border-dashed">
          <p className="text-muted-foreground">You don't have any workspaces yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces?.map((ws) => (
            <div
              key={ws.id}
              onClick={() => setSelectedWorkspaceId(ws.id)}
              className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm cursor-pointer hover:border-primary/50 transition-colors"
            >
              <h3 className="font-semibold text-lg">{ws.name}</h3>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {ws.description || 'No description provided.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
