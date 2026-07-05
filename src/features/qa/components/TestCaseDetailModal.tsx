import React from 'react';
import { TestCase } from '../types';

interface Props {
  testCase: TestCase;
  onClose: () => void;
}

export const TestCaseDetailModal: React.FC<Props> = ({ testCase, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-xl font-bold">{testCase.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">Task ID: {testCase.task_id.split('-')[0]}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            Close
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-muted-foreground block">Priority</span>
              {testCase.priority || '-'}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">Status</span>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                {testCase.status}
              </span>
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">Testing Type</span>
              {testCase.testing_type || '-'}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">Phase</span>
              {testCase.phase || '-'}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">Tester</span>
              {testCase.tester || '-'}
            </div>
            <div>
              <span className="font-semibold text-muted-foreground block">Execution Date</span>
              {testCase.execution_date ? new Date(testCase.execution_date).toLocaleDateString() : '-'}
            </div>
          </div>

          {testCase.description && (
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm">
                {testCase.description}
              </div>
            </div>
          )}

          {testCase.preconditions && (
            <div>
              <h3 className="font-semibold mb-2">Preconditions</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                {testCase.preconditions}
              </div>
            </div>
          )}

          <div>
            <h3 className="font-semibold mb-3">Test Steps</h3>
            {testCase.steps && testCase.steps.length > 0 ? (
              <div className="space-y-3">
                {testCase.steps.map((step) => (
                  <div key={step.id} className="rounded-lg border p-4 text-sm">
                    <div className="flex gap-4">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                        {step.step_number}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div>
                          <span className="font-medium">Action: </span>
                          {step.action}
                        </div>
                        {step.expected_result && (
                          <div className="text-muted-foreground">
                            <span className="font-medium text-foreground">Expected: </span>
                            {step.expected_result}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No test steps defined.</p>
            )}
          </div>

          {testCase.expected_result && (
            <div>
              <h3 className="font-semibold mb-2">Overall Expected Result</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                {testCase.expected_result}
              </div>
            </div>
          )}
          
          {testCase.actual_result && (
            <div>
              <h3 className="font-semibold mb-2">Actual Result</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                {testCase.actual_result}
              </div>
            </div>
          )}

          {testCase.test_data && (
            <div>
              <h3 className="font-semibold mb-2">Test Data</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                {testCase.test_data}
              </div>
            </div>
          )}

          {testCase.notes && (
            <div>
              <h3 className="font-semibold mb-2">Notes</h3>
              <div className="rounded-md bg-muted/20 p-4 text-sm whitespace-pre-wrap">
                {testCase.notes}
              </div>
            </div>
          )}

          {testCase.attachment_url && (
            <div>
              <h3 className="font-semibold mb-2">Attachment</h3>
              <a href={testCase.attachment_url} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                <img src={testCase.attachment_url} alt="Test Case Attachment" className="max-w-full h-auto max-h-[300px] object-contain rounded-md border" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
