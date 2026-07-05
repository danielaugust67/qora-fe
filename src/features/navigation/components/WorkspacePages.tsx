import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle2,
  Grid2X2,
  LucideIcon,
  Search,
  Star,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { navigationApi } from '../api/navigationApi';

export const RecentPage = () => {
  const { data: recent = [] } = useQuery({
    queryKey: ['recent-items'],
    queryFn: navigationApi.getRecent,
  });

  return (
    <WorkspacePageShell title="Recent" description="Quick links to the places you open most often.">
      <div className="divide-y divide-[#dfe1e6] rounded border border-[#dfe1e6] bg-white">
        {recent.map((item) => (
          <Link key={item.id} to={item.path} className="flex items-center justify-between px-4 py-3 hover:bg-[#f7f8f9]">
            <span className="font-medium">{item.title}</span>
            <span className="rounded bg-[#dfe1e6] px-2 py-0.5 text-xs font-semibold">{item.type}</span>
          </Link>
        ))}
        {recent.length === 0 && <EmptyState text="No recent pages yet." />}
      </div>
    </WorkspacePageShell>
  );
};

export const StarredPage = () => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const { data: items = [] } = useQuery({
    queryKey: ['starred-items'],
    queryFn: navigationApi.getStarred,
  });
  const createMutation = useMutation({
    mutationFn: navigationApi.createStarred,
    onSuccess: () => {
      setTitle('');
      queryClient.invalidateQueries({ queryKey: ['starred-items'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: navigationApi.deleteStarred,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['starred-items'] }),
  });

  return (
    <WorkspacePageShell title="Starred" description="Pin important Qora pages for faster access.">
      <div className="rounded border border-[#dfe1e6] bg-white p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 rounded border border-[#dfe1e6] px-3 outline-none focus:border-primary"
            placeholder="Pinned page title"
          />
          <button
            onClick={() => {
              if (!title.trim()) return;
              createMutation.mutate({ title: title.trim(), path: window.location.pathname, type: 'Page' });
            }}
            disabled={createMutation.isPending}
            className="h-10 rounded bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add pinned page
          </button>
        </div>
        <div className="mt-4 divide-y divide-[#dfe1e6] rounded border border-[#dfe1e6]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <Link to={item.path} className="flex items-center gap-2 hover:text-primary">
                <Star className="h-4 w-4 text-[#ffab00]" />
                {item.title}
              </Link>
              <button
                onClick={() => deleteMutation.mutate(item.id)}
                className="grid h-7 w-7 place-items-center rounded text-[#ae2a19] hover:bg-[#ffebe6]"
                aria-label="Delete starred item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <EmptyState text="No starred pages yet." />}
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export const AppsPage = () => {
  const { data: apps = [] } = useQuery({
    queryKey: ['apps'],
    queryFn: navigationApi.getApps,
  });

  return (
    <WorkspacePageShell title="Apps" description="Workspace tools available in this Qora MVP.">
      <div className="grid gap-4 md:grid-cols-3">
        {apps.map((app, index) => (
          <AppTile key={app.id} icon={appIcons[index] || Grid2X2} title={app.title} description={app.description} status={app.status} />
        ))}
      </div>
    </WorkspacePageShell>
  );
};

export const PlansPage = () => {
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: navigationApi.getPlans,
  });

  return (
    <WorkspacePageShell title="Plans" description="Plan status for your current MVP workspace.">
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <InfoPanel key={plan.id} title={plan.title} value={plan.status} description={plan.description} />
        ))}
      </div>
    </WorkspacePageShell>
  );
};

export const FiltersPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [query, setQuery] = useState('');
  const { data: filters = [] } = useQuery({
    queryKey: ['saved-filters'],
    queryFn: navigationApi.getFilters,
  });
  const createMutation = useMutation({
    mutationFn: navigationApi.createFilter,
    onSuccess: () => {
      setName('');
      setQuery('');
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: navigationApi.deleteFilter,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['saved-filters'] }),
  });

  return (
    <WorkspacePageShell title="Filters" description="Create saved filters for work item views.">
      <div className="rounded border border-[#dfe1e6] bg-white p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626f86]" />
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="h-10 w-full rounded border border-[#dfe1e6] pl-9 pr-3 outline-none focus:border-primary"
              placeholder="Filter name"
            />
          </div>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-10 rounded border border-[#dfe1e6] px-3 outline-none focus:border-primary"
            placeholder="status = TODO"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              createMutation.mutate({ name: name.trim(), query: query.trim() });
            }}
            disabled={createMutation.isPending}
            className="h-10 rounded bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
        <div className="mt-4 divide-y divide-[#dfe1e6] rounded border border-[#dfe1e6]">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div>
                <div className="font-medium">{filter.name}</div>
                <div className="text-xs text-[#626f86]">{filter.query || 'No query'}</div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(filter.id)}
                className="grid h-7 w-7 place-items-center rounded text-[#ae2a19] hover:bg-[#ffebe6]"
                aria-label="Delete filter"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {filters.length === 0 && <EmptyState text="No saved filters yet." />}
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export const DashboardsPage = () => {
  const { data: apps = [] } = useQuery({
    queryKey: ['apps'],
    queryFn: navigationApi.getApps,
  });
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: navigationApi.getPlans,
  });

  return (
    <WorkspacePageShell title="Dashboards" description="Workspace-level operational widgets.">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Apps" value={apps.length.toString()} />
        <Metric label="Plans" value={plans.length.toString()} />
        <Metric label="Ready modules" value={apps.filter((app) => app.status === 'enabled').length.toString()} />
        <Metric label="Active plans" value={plans.filter((plan) => plan.status === 'active').length.toString()} />
      </div>
    </WorkspacePageShell>
  );
};

export const TeamsPage = () => {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const { data: members = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: navigationApi.getTeamMembers,
  });
  const createMutation = useMutation({
    mutationFn: navigationApi.createTeamMember,
    onSuccess: () => {
      setName('');
      setEmail('');
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    },
  });
  const deleteMutation = useMutation({
    mutationFn: navigationApi.deleteTeamMember,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-members'] }),
  });

  return (
    <WorkspacePageShell title="Teams" description="Manage lightweight team membership for the workspace UI.">
      <div className="rounded border border-[#dfe1e6] bg-white p-4">
        <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 rounded border border-[#dfe1e6] px-3 outline-none focus:border-primary"
            placeholder="Member name"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-10 rounded border border-[#dfe1e6] px-3 outline-none focus:border-primary"
            placeholder="Email"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              createMutation.mutate({ name: name.trim(), email: email.trim(), role: 'member' });
            }}
            disabled={createMutation.isPending}
            className="inline-flex h-10 items-center gap-2 rounded bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </button>
        </div>
        <div className="mt-4 divide-y divide-[#dfe1e6] rounded border border-[#dfe1e6]">
          {members.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-[#00875a] font-bold text-white">
                  {member.name[0]?.toUpperCase()}
                </span>
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-[#626f86]">{member.email || member.role}</div>
                </div>
              </div>
              <button
                onClick={() => deleteMutation.mutate(member.id)}
                className="grid h-7 w-7 place-items-center rounded text-[#ae2a19] hover:bg-[#ffebe6]"
                aria-label="Delete team member"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {members.length === 0 && <EmptyState text="No team members yet." />}
        </div>
      </div>
    </WorkspacePageShell>
  );
};

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [compact, setCompact] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ['user-settings'],
    queryFn: navigationApi.getSettings,
  });
  const updateMutation = useMutation({
    mutationFn: navigationApi.updateSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['user-settings'] }),
  });

  useEffect(() => {
    if (!settings) return;
    setCompact(settings.compact_rows);
    setEmailDigest(settings.email_digest);
  }, [settings]);

  const updateSettings = (next: { compact_rows: boolean; email_digest: boolean }) => {
    setCompact(next.compact_rows);
    setEmailDigest(next.email_digest);
    updateMutation.mutate(next);
  };

  return (
    <WorkspacePageShell title="Settings" description="Personal Qora interface preferences.">
      <div className="space-y-3 rounded border border-[#dfe1e6] bg-white p-4">
        <SettingRow
          title="Compact work item rows"
          description="Keep Jira-style dense backlog rows."
          checked={compact}
          onChange={(checked) => updateSettings({ compact_rows: checked, email_digest: emailDigest })}
        />
        <SettingRow
          title="Email digest"
          description="Prepare weekly summaries for notification activity."
          checked={emailDigest}
          onChange={(checked) => updateSettings({ compact_rows: compact, email_digest: checked })}
        />
      </div>
    </WorkspacePageShell>
  );
};

const WorkspacePageShell = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-6 bg-white p-8">
    <div>
      <h1 className="text-2xl font-semibold text-[#172b4d]">{title}</h1>
      <p className="mt-1 text-sm text-[#626f86]">{description}</p>
    </div>
    {children}
  </div>
);

const appIcons = [Grid2X2, CheckCircle2, Bell];

const AppTile = ({
  icon: Icon,
  title,
  description,
  status,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  status: string;
}) => (
  <div className="rounded border border-[#dfe1e6] bg-white p-4">
    <div className="flex items-start justify-between gap-3">
      <Icon className="h-5 w-5 text-primary" />
      <span className="rounded bg-[#e3fcef] px-2 py-0.5 text-xs font-semibold text-[#006644]">{status}</span>
    </div>
    <div className="mt-3 font-semibold">{title}</div>
    <p className="mt-1 text-sm text-[#626f86]">{description}</p>
  </div>
);

const InfoPanel = ({ title, value, description }: { title: string; value: string; description: string }) => (
  <div className="rounded border border-[#dfe1e6] bg-white p-4">
    <div className="flex items-center justify-between gap-3">
      <div className="font-semibold text-[#172b4d]">{title}</div>
      <span className="rounded bg-[#dfe1e6] px-2 py-0.5 text-xs font-semibold uppercase">{value}</span>
    </div>
    <p className="mt-2 text-sm text-[#626f86]">{description}</p>
  </div>
);

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded border border-[#dfe1e6] bg-white p-4">
    <div className="text-sm text-[#626f86]">{label}</div>
    <div className="mt-2 text-xl font-semibold text-[#172b4d]">{value}</div>
  </div>
);

const SettingRow = ({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) => (
  <label className="flex cursor-pointer items-center justify-between gap-4 rounded bg-[#f7f8f9] p-3">
    <span>
      <span className="block font-medium">{title}</span>
      <span className="text-sm text-[#626f86]">{description}</span>
    </span>
    <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
  </label>
);

const EmptyState = ({ text }: { text: string }) => <div className="p-4 text-sm text-[#626f86]">{text}</div>;
