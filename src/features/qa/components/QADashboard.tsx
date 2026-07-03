import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { qaApi } from '../api/qaApi';
import { TestCase } from '../types';
import { TestRunnerModal } from './TestRunnerModal';

export const QADashboard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [runningTest, setRunningTest] = useState<TestCase | null>(null);

  const { data: testCases = [], isLoading } = useQuery({
    queryKey: ['test-cases', projectId],
    queryFn: () => qaApi.getTestCases(projectId!),
    enabled: !!projectId,
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">QA Dashboard</h2>
          <p className="mt-2 text-muted-foreground">Review and execute task-linked test cases.</p>
        </div>
        <Link
          to={`/projects/${projectId}/board`}
          className="rounded-md border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground hover:bg-secondary/80"
        >
          Back to Board
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-semibold">Test Case</th>
                <th className="px-6 py-4 font-semibold">Task</th>
                <th className="px-6 py-4 font-semibold">Priority</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    Loading test cases...
                  </td>
                </tr>
              ) : testCases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No test cases found. Open a task detail to create one.
                  </td>
                </tr>
              ) : (
                testCases.map((tc) => (
                  <tr key={tc.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{tc.title}</div>
                      <div className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {tc.description || 'No description'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tc.task_id.split('-')[0]}</td>
                    <td className="px-6 py-4">{tc.priority}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                        {tc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(tc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setRunningTest(tc)}
                        className="ml-auto flex items-center justify-end gap-2 font-medium text-primary hover:underline"
                      >
                        Run Test
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {runningTest && <TestRunnerModal testCase={runningTest} onClose={() => setRunningTest(null)} />}
    </div>
  );
};
