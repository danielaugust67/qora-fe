import { SprintDraft } from '../types';

export const SprintInlineForm = ({
  value,
  onChange,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
}: {
  value: SprintDraft;
  onChange: (value: SprintDraft) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitLabel: string;
  isPending: boolean;
}) => {
  return (
    <div className="mb-4 rounded border border-[#dfe1e6] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <input
          value={value.name}
          onChange={(event) => onChange({ ...value, name: event.target.value })}
          placeholder="Sprint name"
          className="h-9 flex-1 rounded border border-[#dfe1e6] px-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={onSubmit}
          disabled={!value.name.trim() || isPending}
          className="h-9 rounded bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
        >
          {submitLabel}
        </button>
        <button onClick={onCancel} className="h-9 px-3 text-sm font-medium">
          Cancel
        </button>
      </div>
      <textarea
        value={value.goal}
        onChange={(event) => onChange({ ...value, goal: event.target.value })}
        placeholder="Sprint goal"
        className="mt-3 min-h-[70px] w-full rounded border border-[#dfe1e6] p-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  );
};
