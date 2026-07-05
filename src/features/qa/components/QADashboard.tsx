import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, Edit2, Trash2 } from 'lucide-react';
import { qaApi } from '../api/qaApi';
import { taskApi } from '@/features/task/api/taskApi';
import { TestCase } from '../types';
import { TestRunnerModal } from './TestRunnerModal';
import { CreateTestCaseForm } from './CreateTestCaseForm';
import { EditTestCaseForm } from './EditTestCaseForm';
import { TestCaseDetailModal } from './TestCaseDetailModal';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';

export const QADashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const queryClient = useQueryClient();
  const [runningTest, setRunningTest] = useState<TestCase | null>(null);
  const [editingTest, setEditingTest] = useState<TestCase | null>(null);
  const [viewingTest, setViewingTest] = useState<TestCase | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState('');

  const { data: testCases = [], isLoading } = useQuery({
    queryKey: ['test-cases', projectId],
    queryFn: () => qaApi.getTestCases(projectId!),
    enabled: !!projectId,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId!),
    enabled: !!projectId,
  });

  const handleDelete = async (id: string, taskId: string) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await qaApi.deleteTestCase(id);
        queryClient.invalidateQueries({ queryKey: ['test-cases', projectId] });
        queryClient.invalidateQueries({ queryKey: ['task', taskId, 'test-cases'] });
      } catch (err) {
        console.error('Failed to delete test case', err);
        alert('Failed to delete test case');
      }
    }
  };

  return (
    <ProjectChrome projectId={projectId!}>
    <div className="space-y-6 bg-white px-8 py-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#172b4d]">QA Dashboard</h2>
          <p className="mt-1 text-sm text-[#626f86]">Review and execute task-linked test cases.</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="rounded bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
        >
          Create Test Case
        </button>
      </div>

      <div className="overflow-hidden rounded border border-[#dfe1e6] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#f7f8f9] text-[#44546f]">
              <tr>
                <th className="px-6 py-4 font-semibold">Test Case</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Type</th>
                <th className="px-6 py-4 font-semibold">Tester</th>
                <th className="px-6 py-4 font-semibold">Phase</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    Loading test cases...
                  </td>
                </tr>
              ) : testCases.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-muted-foreground">
                    No test cases found. Open a task detail to create one.
                  </td>
                </tr>
              ) : (
                testCases.map((tc) => (
                  <tr key={tc.id} className="transition-colors hover:bg-[#f7f8f9]">
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setViewingTest(tc)}
                        className="font-medium text-primary hover:underline text-left block"
                      >
                        {tc.title}
                      </button>
                      {tc.attachment_url && (
                        <a href={tc.attachment_url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs text-primary hover:underline">
                          📎 View Attachment
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {tasks.find(t => t.id === tc.task_id)?.title || tc.task_id.split('-')[0]}
                    </td>
                    <td className="px-6 py-4">{tc.priority}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tc.testing_type || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tc.tester || '-'}</td>
                    <td className="px-6 py-4 text-muted-foreground">{tc.phase || '-'}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {tc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(tc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => setRunningTest(tc)}
                          className="text-primary hover:text-primary/80"
                          title="Run Test"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingTest(tc)}
                          className="text-primary hover:text-primary/80"
                          title="Edit Test Case"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tc.id, tc.task_id)}
                          className="text-destructive hover:text-destructive/80"
                          title="Delete Test Case"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {runningTest && <TestRunnerModal testCase={runningTest} onClose={() => setRunningTest(null)} />}
      {viewingTest && <TestCaseDetailModal testCase={viewingTest} onClose={() => setViewingTest(null)} />}
      
      {editingTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[90vh] overflow-y-auto">
            <EditTestCaseForm 
              testCase={editingTest} 
              onCancel={() => setEditingTest(null)}
              onSuccess={() => setEditingTest(null)}
            />
          </div>
        </div>
      )}

      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium">Select Task</label>
              <select 
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="h-10 w-full rounded-md border border-[#dfe1e6] bg-background px-3"
              >
                <option value="">-- Select a task to link --</option>
                {tasks.map(t => (
                  <option key={t.id} value={t.id}>{t.id.split('-')[0]} - {t.title}</option>
                ))}
              </select>
            </div>
            
            {selectedTaskId ? (
              <CreateTestCaseForm 
                taskId={selectedTaskId} 
                onCancel={() => {
                  setIsCreating(false);
                  setSelectedTaskId('');
                }} 
              />
            ) : (
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
    </ProjectChrome>
  );
};
