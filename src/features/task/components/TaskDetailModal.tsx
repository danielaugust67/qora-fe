import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskApi } from '@/features/task/api/taskApi';
import { Task } from '@/features/task/types';
import { useAuthStore } from '@/features/auth/store/authStore';
import { qaApi } from '@/features/qa/api/qaApi';
import { CreateTestCaseForm } from '@/features/qa/components/CreateTestCaseForm';
import { TestRunnerModal } from '@/features/qa/components/TestRunnerModal';
import { TestCase } from '@/features/qa/types';
import { bugApi } from '@/features/bug/api/bugApi';
import { CreateBugForm } from '@/features/bug/components/CreateBugForm';
import { Bug } from '@/features/bug/types';
interface TaskDetailModalProps {
  task: Task;
  projectId: string;
  onClose: () => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ task, projectId, onClose }) => {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [commentText, setCommentText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isCreatingTestCase, setIsCreatingTestCase] = useState(false);
  const [runningTest, setRunningTest] = useState<TestCase | null>(null);
  const [isCreatingBug, setIsCreatingBug] = useState(false);
  const [bugTestCaseId, setBugTestCaseId] = useState<string | undefined>();

  const { data: comments = [] } = useQuery({
    queryKey: ['task', task.id, 'comments'],
    queryFn: () => taskApi.getComments(task.id),
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['task', task.id, 'attachments'],
    queryFn: () => taskApi.getAttachments(task.id),
  });

  const { data: testCases = [], isLoading: testCasesLoading } = useQuery({
    queryKey: ['task', task.id, 'test-cases'],
    queryFn: () => qaApi.getTaskTestCases(task.id),
    enabled: !!task.id,
  });

  const { data: bugs = [], isLoading: bugsLoading } = useQuery({
    queryKey: ['task', task.id, 'bugs'],
    queryFn: () => bugApi.getTaskBugs(task.id),
    enabled: !!task.id,
  });

  const addCommentMutation = useMutation({
    mutationFn: (content: string) => taskApi.addComment(task.id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id, 'comments'] });
      setCommentText('');
    },
  });

  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => taskApi.uploadAttachment(task.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id, 'attachments'] });
      setIsUploading(false);
    },
    onError: () => setIsUploading(false),
  });

  const updateBugStatusMutation = useMutation({
    mutationFn: ({ bugId, status }: { bugId: string; status: string }) => bugApi.updateStatus(bugId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', task.id, 'bugs'] });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      uploadAttachmentMutation.mutate(e.target.files[0]);
    }
  };

  const openBugForm = (testCaseId?: string) => {
    setBugTestCaseId(testCaseId);
    setIsCreatingBug(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-2xl max-h-[90vh] rounded-xl border shadow-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2 py-1 bg-secondary text-secondary-foreground rounded uppercase tracking-wider">
              {task.type}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {task.id.split('-')[0]} {/* Short ID */}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Title & Desc */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">{task.title}</h2>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-2 py-1 bg-muted rounded-md font-medium">Status: {task.status}</span>
              <span className="px-2 py-1 bg-muted rounded-md font-medium">Priority: {task.priority}</span>
            </div>
            <div className="prose prose-sm dark:prose-invert">
              <p>{task.description || 'No description provided.'}</p>
            </div>
          </div>

          {/* Test Cases */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Test Cases</h3>
              <button
                onClick={() => setIsCreatingTestCase((value) => !value)}
                className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                {isCreatingTestCase ? 'Close Form' : 'Create Test Case'}
              </button>
            </div>

            {isCreatingTestCase && (
              <CreateTestCaseForm taskId={task.id} onCancel={() => setIsCreatingTestCase(false)} />
            )}

            {testCasesLoading ? (
              <p className="text-sm text-muted-foreground">Loading test cases...</p>
            ) : testCases.length > 0 ? (
              <div className="space-y-3">
                {testCases.map((testCase) => (
                  <div
                    key={testCase.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/10 p-3"
                  >
                    <div>
                      <div className="font-medium">{testCase.title}</div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>Status: {testCase.status}</span>
                        <span>Priority: {testCase.priority}</span>
                        <span>{testCase.steps?.length ?? 0} steps</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {testCase.status === 'FAILED' && (
                        <button
                          onClick={() => openBugForm(testCase.id)}
                          className="rounded-md bg-destructive/10 px-3 py-1.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Report Bug
                        </button>
                      )}
                      <button
                        onClick={() => setRunningTest(testCase)}
                        className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                      >
                        Run Test
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No test cases yet.</p>
            )}
          </div>

          {/* Bug Reports */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Bug Reports</h3>
              <button
                onClick={() => openBugForm()}
                className="rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                Report Bug
              </button>
            </div>

            {isCreatingBug && (
              <CreateBugForm
                taskId={task.id}
                projectId={projectId}
                testCases={testCases}
                initialTestCaseId={bugTestCaseId}
                onCancel={() => {
                  setIsCreatingBug(false);
                  setBugTestCaseId(undefined);
                }}
              />
            )}

            {bugsLoading ? (
              <p className="text-sm text-muted-foreground">Loading bug reports...</p>
            ) : bugs.length > 0 ? (
              <div className="space-y-3">
                {bugs.map((bug: Bug) => (
                  <div key={bug.id} className="rounded-lg border bg-muted/10 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="font-medium">{bug.title}</div>
                        <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span>Status: {bug.status}</span>
                          <span>Severity: {bug.severity}</span>
                          <span>Priority: {bug.priority}</span>
                        </div>
                      </div>
                      <select
                        value={bug.status}
                        onChange={(event) =>
                          updateBugStatusMutation.mutate({ bugId: bug.id, status: event.target.value })
                        }
                        className="h-9 rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="OPEN">Open</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="FIXED">Fixed</option>
                        <option value="RETEST">Retest</option>
                        <option value="CLOSED">Closed</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </div>
                    {bug.description && <p className="mt-3 text-sm text-muted-foreground">{bug.description}</p>}
                    {bug.screenshot_url && (
                      <a
                        href={bug.screenshot_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
                      >
                        View screenshot
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No bug reports yet.</p>
            )}
          </div>

          {/* Attachments */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Attachments</h3>
              <div>
                <input 
                  type="file" 
                  id="file-upload" 
                  className="hidden" 
                  onChange={handleFileUpload} 
                  disabled={isUploading}
                />
                <label 
                  htmlFor="file-upload" 
                  className="cursor-pointer text-sm bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md hover:bg-secondary/80 transition-colors"
                >
                  {isUploading ? 'Uploading...' : 'Upload File'}
                </label>
              </div>
            </div>
            
            {attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {attachments.map(att => (
                  <a 
                    key={att.id} 
                    href={att.file_url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="block p-3 border rounded-lg hover:border-primary/50 transition-colors bg-muted/10 group"
                  >
                    <div className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                      {att.file_name}
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No attachments yet.</p>
            )}
          </div>

          {/* Comments */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Comments</h3>
            
            <div className="space-y-4">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {/* Placeholder for user avatar initals */}
                    U
                  </div>
                  <div className="flex-1 bg-muted/30 p-3 rounded-lg rounded-tl-none border">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-sm">User</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment Input */}
            <div className="flex gap-4 pt-4 border-t">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <textarea 
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full text-sm p-3 rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                />
                <div className="flex justify-end">
                  <button 
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    onClick={() => addCommentMutation.mutate(commentText)}
                    className="bg-primary text-primary-foreground text-sm px-4 py-1.5 rounded-md font-medium disabled:opacity-50"
                  >
                    {addCommentMutation.isPending ? 'Saving...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      {runningTest && (
        <TestRunnerModal
          testCase={runningTest}
          onClose={() => setRunningTest(null)}
        />
      )}
    </div>
  );
};
