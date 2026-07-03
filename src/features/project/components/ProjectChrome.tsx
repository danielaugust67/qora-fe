import { Link, useLocation } from 'react-router-dom';
import { BookOpen, CalendarDays, FileText, FormInput, LayoutGrid, ListTodo, MoreHorizontal, Share2, Users, Zap } from 'lucide-react';

interface ProjectChromeProps {
  projectId: string;
  title?: string;
  children: React.ReactNode;
}

const tabs = [
  { label: 'Summary', icon: BookOpen, path: 'summary', disabled: true },
  { label: 'Backlog', icon: ListTodo, path: 'backlog' },
  { label: 'Board', icon: LayoutGrid, path: 'board' },
  { label: 'Calendar', icon: CalendarDays, path: 'calendar', disabled: true },
  { label: 'Timeline', icon: MoreHorizontal, path: 'timeline', disabled: true },
  { label: 'Docs', icon: FileText, path: 'docs', disabled: true },
  { label: 'Forms', icon: FormInput, path: 'forms', disabled: true },
  { label: 'QA', icon: Zap, path: 'qa' },
];

export const ProjectChrome = ({ projectId, title = 'Qora Project', children }: ProjectChromeProps) => {
  const location = useLocation();

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-white">
      <div className="border-b border-[#dfe1e6] bg-white px-8 pt-5">
        <div className="mb-2 text-sm text-[#626f86]">Spaces</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center rounded bg-[#ffab00] text-sm font-bold text-white">Q</span>
            <h1 className="text-xl font-semibold text-[#172b4d]">{title}</h1>
            <button className="grid h-8 w-8 place-items-center rounded border border-[#dfe1e6] hover:bg-[#f1f2f4]" aria-label="Members">
              <Users className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f1f2f4]" aria-label="More">
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <button className="grid h-8 w-8 place-items-center rounded border border-[#dfe1e6] hover:bg-[#f1f2f4]" aria-label="Share">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="grid h-8 w-8 place-items-center rounded border border-[#dfe1e6] hover:bg-[#f1f2f4]" aria-label="Automation">
              <Zap className="h-4 w-4" />
            </button>
          </div>
        </div>

        <nav className="mt-3 flex h-10 items-end gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = location.pathname.endsWith(`/${tab.path}`);
            const className = `flex h-10 items-center gap-2 border-b-2 px-3 text-sm font-medium ${
              active
                ? 'border-[#0c66e4] text-[#0c66e4]'
                : 'border-transparent text-[#44546f] hover:text-[#172b4d]'
            }`;

            if (tab.disabled) {
              return (
                <span key={tab.label} className={`${className} cursor-default opacity-75`}>
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </span>
              );
            }

            return (
              <Link key={tab.label} to={`/projects/${projectId}/${tab.path}`} className={className}>
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </div>
  );
};
