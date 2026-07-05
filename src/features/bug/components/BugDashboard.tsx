import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { bugApi } from '../api/bugApi';
import { Bug } from '../types';
import { taskApi } from '@/features/task/api/taskApi';

export const BugDashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [viewingBug, setViewingBug] = useState<Bug | null>(null);

  const { data: bugs = [], isLoading } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: () => bugApi.getProjectBugs(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId!),
    enabled: !!projectId,
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: ({ bugId, status }: { bugId: string; status: string }) => bugApi.updateStatus(bugId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bugs', projectId] }),
  });

  const deleteBugMutation = useMutation({
    mutationFn: (bugId: string) => bugApi.deleteBug(bugId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bugs', projectId] }),
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bug?')) {
      deleteBugMutation.mutate(id);
    }
  };

  const getTaskTitle = (taskId: string) => {
    return tasks.find(t => t.id === taskId)?.title || taskId.split('-')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="space-y-6 bg-white px-8 py-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#172b4d]">Bug Dashboard</h2>
            <p className="mt-1 text-sm text-[#626f86]">Overview of all project defects and issues.</p>
          </div>
        </div>

        <div className="overflow-hidden rounded border border-[#dfe1e6] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#f7f8f9] text-[#44546f]">
                <tr>
                  <th className="px-6 py-4 font-semibold">Bug Title</th>
                  <th className="px-6 py-4 font-semibold">Linked Task</th>
                  <th className="px-6 py-4 font-semibold">Severity</th>
                  <th className="px-6 py-4 font-semibold">Priority</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Reported At</th>
                  <th className="px-6 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      Loading bugs...
                    </td>
                  </tr>
                ) : bugs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      No bugs found in this project.
                    </td>
                  </tr>
                ) : (
                  bugs.map((bug) => (
                    <tr key={bug.id} className="transition-colors hover:bg-[#f7f8f9]">
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setViewingBug(bug)}
                          className="font-medium text-primary hover:underline text-left block"
                        >
                          {bug.title}
                        </button>
                        {bug.screenshot_url && (
                          <a href={bug.screenshot_url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                            📎 View Screenshot
                          </a>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {getTaskTitle(bug.task_id)}
                      </td>
                      <td className="px-6 py-4">{bug.severity || '-'}</td>
                      <td className="px-6 py-4">{bug.priority || '-'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={bug.status}
                          onChange={(e) => updateBugStatusMutation.mutate({ bugId: bug.id, status: e.target.value })}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium outline-none cursor-pointer ${getStatusColor(bug.status)}`}
                        >
                          <option value="OPEN" className="bg-white text-black">OPEN</option>
                          <option value="IN_PROGRESS" className="bg-white text-black">IN_PROGRESS</option>
                          <option value="RESOLVED" className="bg-white text-black">RESOLVED</option>
                          <option value="CLOSED" className="bg-white text-black">CLOSED</option>
                          <option value="REJECTED" className="bg-white text-black">REJECTED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(bug.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDelete(bug.id)}
                          className="text-destructive hover:text-destructive/80 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {viewingBug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-xl flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between border-b p-6">
                <h2 className="text-xl font-bold">{viewingBug.title}</h2>
                <button onClick={() => setViewingBug(null)} className="text-muted-foreground hover:text-foreground">
                  Close
                </button>
              </div>
              <div className="p-6 overflow-y-auto space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-semibold block text-muted-foreground">Status</span>
                    {viewingBug.status}
                  </div>
                  <div>
                    <span className="font-semibold block text-muted-foreground">Severity</span>
                    {viewingBug.severity || '-'}
                  </div>
                  <div>
                    <span className="font-semibold block text-muted-foreground">Priority</span>
                    {viewingBug.priority || '-'}
                  </div>
                  <div>
                    <span className="font-semibold block text-muted-foreground">Environment</span>
                    {viewingBug.environment || '-'}
                  </div>
                  <div>
                    <span className="font-semibold block text-muted-foreground">Browser</span>
                    {viewingBug.browser || '-'}
                  </div>
                  <div>
                    <span className="font-semibold block text-muted-foreground">Device</span>
                    {viewingBug.device || '-'}
                  </div>
                </div>

                {viewingBug.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{viewingBug.description}</div>
                  </div>
                )}
                {viewingBug.steps_to_reproduce && (
                  <div>
                    <h3 className="font-semibold mb-2">Steps to Reproduce</h3>
                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{viewingBug.steps_to_reproduce}</div>
                  </div>
                )}
                {viewingBug.expected_result && (
                  <div>
                    <h3 className="font-semibold mb-2">Expected Result</h3>
                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{viewingBug.expected_result}</div>
                  </div>
                )}
                {viewingBug.actual_result && (
                  <div>
                    <h3 className="font-semibold mb-2">Actual Result</h3>
                    <div className="rounded-md bg-muted/20 p-4 whitespace-pre-wrap">{viewingBug.actual_result}</div>
                  </div>
                )}
                {viewingBug.screenshot_url && (
                  <div>
                    <h3 className="font-semibold mb-2">Screenshot</h3>
                    <img src={viewingBug.screenshot_url} alt="Bug Screenshot" className="max-w-full rounded border" />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProjectChrome>
  );
};
