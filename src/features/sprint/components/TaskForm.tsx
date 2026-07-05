import { RichTextEditor } from '@/components/ui/RichTextEditor';
import { X } from 'lucide-react';
import { TaskDraft } from '../types';

export const TaskInlineForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
}: {
  value: TaskDraft;
  onChange: (value: TaskDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isPending: boolean;
}) => {
  return (
    <div className="border-b border-[#dfe1e6] bg-white p-3">
      <div className="grid gap-3 md:grid-cols-[1fr_150px_150px_auto]">
        <input
          value={value.title}
          onChange={(event) => onChange({ ...value, title: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          placeholder="What needs to be done?"
        />
        <select
          value={value.type}
          onChange={(event) => onChange({ ...value, type: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-2 text-sm"
        >
          <option value="TASK">Task</option>
          <option value="STORY">Story</option>
          <option value="BUG">Bug</option>
          <option value="EPIC">Epic</option>
        </select>
        <select
          value={value.priority}
          onChange={(event) => onChange({ ...value, priority: event.target.value })}
          className="h-9 rounded border border-[#dfe1e6] px-2 text-sm"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </select>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!value.title.trim() || isPending}
            className="h-9 rounded bg-primary px-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="grid h-9 w-9 place-items-center rounded hover:bg-[#f1f2f4]"
            aria-label="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
      <RichTextEditor
        content={value.description}
        onChange={(content) => onChange({ ...value, description: content })}
        placeholder="Description (optional)"
      />
    </div>
  );
};
