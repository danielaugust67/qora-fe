import React, { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as z from 'zod';
import { qaApi } from '../api/qaApi';
import { TestCase } from '../types';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  preconditions: z.string().optional(),
  priority: z.string().optional(),
  expected_result: z.string().optional(),
  testing_type: z.string().optional(),
  test_data: z.string().optional(),
  actual_result: z.string().optional(),
  tester: z.string().optional(),
  type_of_testing: z.string().optional(),
  notes: z.string().optional(),
  phase: z.string().optional(),
  attachment_url: z.string().optional(),
  steps: z
    .array(
      z.object({
        action: z.string().min(1, 'Action is required'),
        expected_result: z.string().optional(),
      }),
    )
    .min(1, 'At least one step is required'),
});

type FormData = z.infer<typeof schema>;

interface Props {
  testCase: TestCase;
  onCancel: () => void;
  onSuccess: () => void;
}

export const EditTestCaseForm: React.FC<Props> = ({ testCase, onCancel, onSuccess }) => {
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: testCase.title,
      description: testCase.description || '',
      preconditions: testCase.preconditions || '',
      priority: testCase.priority || 'MEDIUM',
      expected_result: testCase.expected_result || '',
      testing_type: testCase.testing_type || '',
      test_data: testCase.test_data || '',
      actual_result: testCase.actual_result || '',
      tester: testCase.tester || '',
      type_of_testing: testCase.type_of_testing || '',
      notes: testCase.notes || '',
      phase: testCase.phase || '',
      attachment_url: testCase.attachment_url || '',
      steps: testCase.steps && testCase.steps.length > 0 
        ? testCase.steps.map(s => ({ action: s.action, expected_result: s.expected_result || '' }))
        : [{ action: '', expected_result: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'steps',
  });

  const attachmentUrl = watch('attachment_url');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await qaApi.uploadImage(file);
      setValue('attachment_url', res.url);
    } catch (error) {
      console.error('Failed to upload image:', error);
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: FormData) => qaApi.updateTestCase(testCase.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases', testCase.project_id] });
      queryClient.invalidateQueries({ queryKey: ['task', testCase.task_id, 'test-cases'] });
      onSuccess();
    },
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 rounded-xl border bg-card p-6 shadow-sm duration-300">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold">Edit Test Case</h3>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>

      <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Title</label>
              <input
                {...register('title')}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
              {errors.title && <p className="mt-1 text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Description</label>
              <textarea
                {...register('description')}
                className="min-h-[100px] w-full rounded-md border bg-background p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Preconditions</label>
              <textarea
                {...register('preconditions')}
                className="min-h-[60px] w-full rounded-md border bg-background p-3"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Priority</label>
              <select {...register('priority')} className="h-10 w-full rounded-md border bg-background px-3">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">Overall Expected Result</label>
              <textarea
                {...register('expected_result')}
                className="min-h-[60px] w-full rounded-md border bg-background p-3"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Testing Type</label>
              <input
                {...register('testing_type')}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Type of Testing</label>
              <input
                {...register('type_of_testing')}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Phase</label>
              <input
                {...register('phase')}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Test Data</label>
              <textarea
                {...register('test_data')}
                className="min-h-[60px] w-full rounded-md border bg-background p-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Tester</label>
              <input
                {...register('tester')}
                className="h-10 w-full rounded-md border bg-background px-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Actual Result</label>
              <textarea
                {...register('actual_result')}
                className="min-h-[60px] w-full rounded-md border bg-background p-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Notes</label>
              <textarea
                {...register('notes')}
                className="min-h-[60px] w-full rounded-md border bg-background p-3"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Attachment (Image)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="mb-2 block w-full text-sm text-muted-foreground file:mr-4 file:rounded-md file:border-0 file:bg-primary/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary hover:file:bg-primary/20"
              />
              {isUploading && <p className="text-sm text-muted-foreground">Uploading...</p>}
              {attachmentUrl && (
                <div className="mt-2">
                  <a href={attachmentUrl} target="_blank" rel="noreferrer" className="text-sm text-primary hover:underline">
                    View Uploaded Image
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="mb-2 flex items-center justify-between">
            <label className="block text-sm font-medium">Test Steps</label>
            <button
              type="button"
              onClick={() => append({ action: '', expected_result: '' })}
              className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20"
            >
              Add Step
            </button>
          </div>

          {errors.steps?.root && <p className="text-sm text-destructive">{errors.steps.root.message}</p>}

          <div className="max-h-[500px] space-y-4 overflow-y-auto pr-2">
            {fields.map((field, index) => (
              <div key={field.id} className="group relative rounded-lg border bg-muted/20 p-4">
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded bg-destructive/10 px-2 py-1 text-xs text-destructive hover:bg-destructive/20"
                    disabled={fields.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3 flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Action</label>
                    <input
                      {...register(`steps.${index}.action`)}
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      placeholder="Click login button"
                    />
                    {errors.steps?.[index]?.action && (
                      <p className="mt-1 text-xs text-destructive">{errors.steps[index]?.action?.message}</p>
                    )}
                  </div>
                </div>

                <div className="pl-9">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Expected Result
                  </label>
                  <input
                    {...register(`steps.${index}.expected_result`)}
                    className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                    placeholder="The correct response appears"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-4 border-t pt-6">
          <button type="button" onClick={onCancel} className="rounded-md px-6 py-2 text-sm font-medium hover:bg-muted">
            Cancel
          </button>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
