import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bugApi } from '../api/bugApi';
import { TestCase } from '@/features/qa/types';

interface Props {
  taskId: string;
  projectId: string;
  testCases: TestCase[];
  initialTestCaseId?: string;
  onCancel: () => void;
}

export const CreateBugForm: React.FC<Props> = ({ taskId, projectId, testCases, initialTestCaseId, onCancel }) => {
  const queryClient = useQueryClient();
  const [testCaseId, setTestCaseId] = useState(initialTestCaseId || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [priority, setPriority] = useState('MEDIUM');
  const [environment, setEnvironment] = useState('');
  const [browser, setBrowser] = useState('');
  const [device, setDevice] = useState('');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [screenshot, setScreenshot] = useState<File | undefined>();

  const createMutation = useMutation({
    mutationFn: () =>
      bugApi.createBug(taskId, {
        test_case_id: testCaseId || undefined,
        title: title || selectedTestCaseTitle(testCases, testCaseId) || 'Bug report',
        description,
        severity,
        priority,
        environment,
        browser,
        device,
        steps_to_reproduce: stepsToReproduce,
        expected_result: expectedResult,
        actual_result: actualResult,
        screenshot,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId, 'bugs'] });
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      onCancel();
    },
  });

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold">Report Bug</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          createMutation.mutate();
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium">Related Failed Test</label>
            <select
              value={testCaseId}
              onChange={(event) => setTestCaseId(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3"
            >
              <option value="">Manual bug</option>
              {testCases.map((testCase) => (
                <option key={testCase.id} value={testCase.id}>
                  {testCase.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="h-10 w-full rounded-md border bg-background px-3"
              placeholder="Checkout button returns 500"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Severity</label>
            <select value={severity} onChange={(event) => setSeverity(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Priority</label>
            <select value={priority} onChange={(event) => setPriority(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Environment</label>
            <input value={environment} onChange={(event) => setEnvironment(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3" placeholder="Staging" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Browser</label>
            <input value={browser} onChange={(event) => setBrowser(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3" placeholder="Chrome 126" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Device</label>
            <input value={device} onChange={(event) => setDevice(event.target.value)} className="h-10 w-full rounded-md border bg-background px-3" placeholder="Windows desktop" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Screenshot</label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) => setScreenshot(event.target.files?.[0])}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-secondary-foreground"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="min-h-[90px] rounded-md border bg-background p-3" placeholder="Description" />
          <textarea value={stepsToReproduce} onChange={(event) => setStepsToReproduce(event.target.value)} className="min-h-[90px] rounded-md border bg-background p-3" placeholder="Steps to reproduce" />
          <textarea value={expectedResult} onChange={(event) => setExpectedResult(event.target.value)} className="min-h-[90px] rounded-md border bg-background p-3" placeholder="Expected result" />
          <textarea value={actualResult} onChange={(event) => setActualResult(event.target.value)} className="min-h-[90px] rounded-md border bg-background p-3" placeholder="Actual result" />
        </div>

        <div className="flex justify-end gap-3 border-t pt-5">
          <button type="button" onClick={onCancel} className="rounded-md px-4 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {createMutation.isPending ? 'Reporting...' : 'Report Bug'}
          </button>
        </div>
      </form>
    </div>
  );
};

const selectedTestCaseTitle = (testCases: TestCase[], testCaseId: string) => {
  return testCases.find((testCase) => testCase.id === testCaseId)?.title;
};
