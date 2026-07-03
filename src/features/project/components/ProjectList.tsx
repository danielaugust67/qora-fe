import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '../api/projectApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';

const createProjectSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type CreateFormValues = z.infer<typeof createProjectSchema>;

interface ProjectListProps {
  workspaceId: string;
}

export const ProjectList: React.FC<ProjectListProps> = ({ workspaceId }) => {
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects', workspaceId],
    queryFn: () => projectApi.getProjects(workspaceId),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFormValues>({
    resolver: zodResolver(createProjectSchema),
  });

  const mutation = useMutation({
    mutationFn: (data: CreateFormValues) => projectApi.createProject({ ...data, workspace_id: workspaceId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceId] });
      setIsCreating(false);
      reset();
    },
  });

  const onSubmit = (data: CreateFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold tracking-tight">Projects</h3>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-4 py-2 border"
        >
          {isCreating ? 'Cancel' : 'New Project'}
        </button>
      </div>

      {isCreating && (
        <div className="p-6 bg-card rounded-xl border shadow-sm max-w-md mb-8">
          <h4 className="text-lg font-medium mb-4">New Project</h4>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <input
                {...register('name')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="E.g. Qora Web App"
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                placeholder="What is the goal of this project?"
              />
            </div>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-10 px-4 py-2"
            >
              {mutation.isPending ? 'Creating...' : 'Create Project'}
            </button>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-sm text-muted-foreground">Loading projects...</div>
      ) : projects?.length === 0 ? (
        <div className="text-center p-8 border rounded-xl border-dashed">
          <p className="text-muted-foreground">No projects in this workspace yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects?.map((proj) => (
            <Link
              to={`/projects/${proj.id}/board`}
              key={proj.id}
              className="p-5 rounded-xl border bg-card text-card-foreground shadow-sm hover:border-primary/50 transition-colors group cursor-pointer block"
            >
              <h4 className="font-semibold group-hover:text-primary transition-colors">{proj.name}</h4>
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {proj.description || 'No description provided.'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
