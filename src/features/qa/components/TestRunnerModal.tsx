import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { qaApi } from '../api/qaApi';
import { TestCase } from '../types';

interface Props {
  testCase: TestCase;
  onClose: () => void;
}

export const TestRunnerModal: React.FC<Props> = ({ testCase, onClose }) => {
  const queryClient = useQueryClient();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [actualResult, setActualResult] = useState('');
  const [notes, setNotes] = useState('');

  const { data: detail, isLoading } = useQuery({
    queryKey: ['test-case', testCase.id],
    queryFn: () => qaApi.getTestCaseDetail(testCase.id),
  });

  const executeMutation = useMutation({
    mutationFn: (status: string) =>
      qaApi.executeTestCase(testCase.id, {
        status,
        actual_result: actualResult,
        notes,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-case', testCase.id] });
      queryClient.invalidateQueries({ queryKey: ['task', testCase.task_id, 'test-cases'] });
      queryClient.invalidateQueries({ queryKey: ['test-cases', testCase.project_id] });
      onClose();
    },
  });

  if (isLoading || !detail) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
        <div className="w-full max-w-3xl rounded-xl border bg-card p-8 text-center text-muted-foreground shadow-lg">
          Loading test environment...
        </div>
      </div>
    );
  }

  const steps = detail.steps || [];
  const isLastStep = steps.length === 0 || currentStepIndex === steps.length - 1;
  const currentStep = steps[currentStepIndex];
  const progress = steps.length === 0 ? 0 : Math.round(((currentStepIndex + 1) / steps.length) * 100);

  const submitResult = (status: string) => {
    executeMutation.mutate(status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in-95 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border bg-card shadow-lg duration-200">
        <div className="flex items-center justify-between border-b bg-muted/20 px-6 py-4">
          <div>
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-primary">Test Runner</div>
            <h2 className="text-xl font-bold">{detail.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-muted">
            Close
          </button>
        </div>

        <div className="flex flex-1 gap-8 overflow-y-auto p-6">
          <div className="w-1/3 space-y-6 border-r pr-6">
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Preconditions
              </h4>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">{detail.preconditions || 'None'}</div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Overall Expected
              </h4>
              <div className="rounded-lg border bg-muted/30 p-3 text-sm">{detail.expected_result || 'None'}</div>
            </div>

            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Progress</h4>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-xs font-bold">{progress}%</span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col">
            {steps.length > 0 ? (
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                    {currentStepIndex + 1}
                  </div>
                  <h3 className="text-lg font-semibold">
                    Step {currentStepIndex + 1} of {steps.length}
                  </h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm font-semibold text-muted-foreground">Action to perform:</span>
                    <p className="mt-1 text-lg">{currentStep.action}</p>
                  </div>

                  {currentStep.expected_result && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100">
                      <span className="mb-1 block text-xs font-bold uppercase tracking-wider">Expected Result:</span>
                      {currentStep.expected_result}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 text-center text-muted-foreground">This test case has no steps configured.</div>
            )}

            <div className="mt-6 space-y-4 border-t pt-6">
              <textarea
                value={actualResult}
                onChange={(event) => setActualResult(event.target.value)}
                placeholder="Actual result observed during execution"
                className="min-h-[80px] w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Execution notes"
                className="min-h-[80px] w-full rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-3">
                  <button
                    onClick={() => submitResult('FAILED')}
                    disabled={executeMutation.isPending}
                    className="rounded-md bg-destructive/10 px-5 py-2 font-bold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:opacity-50"
                  >
                    Fail
                  </button>
                  <button
                    onClick={() => submitResult('BLOCKED')}
                    disabled={executeMutation.isPending}
                    className="rounded-md bg-amber-100 px-5 py-2 font-bold text-amber-800 transition-colors hover:bg-amber-200 disabled:opacity-50"
                  >
                    Block
                  </button>
                </div>

                {steps.length > 0 && !isLastStep ? (
                  <button
                    onClick={() => setCurrentStepIndex((prev) => prev + 1)}
                    className="rounded-md bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl"
                  >
                    Next Step
                  </button>
                ) : (
                  <button
                    onClick={() => submitResult('PASSED')}
                    disabled={executeMutation.isPending}
                    className="rounded-md bg-primary px-8 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:shadow-xl disabled:opacity-50"
                  >
                    Pass
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
