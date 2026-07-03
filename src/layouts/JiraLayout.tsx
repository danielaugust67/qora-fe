import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Bell,
  CircleHelp,
  ClipboardList,
  Filter,
  Gauge,
  Grid2X2,
  Home,
  LayoutDashboard,
  Plus,
  Search,
  Settings,
  Star,
  Users,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';

interface JiraLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'For you', icon: Home },
  { label: 'Recent', icon: ClipboardList },
  { label: 'Starred', icon: Star },
  { label: 'Apps', icon: Grid2X2 },
  { label: 'Plans', icon: Gauge },
];

export const JiraLayout = ({ children }: JiraLayoutProps) => {
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isProjectPage = location.pathname.startsWith('/projects/');

  return (
    <div className="min-h-screen bg-[#f7f8f9] text-[#172b4d]">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-[#dfe1e6] bg-white px-4">
        <div className="flex w-56 items-center gap-3">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f1f2f4]" aria-label="App switcher">
            <Grid2X2 className="h-4 w-4" />
          </button>
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded bg-[#0c66e4] text-sm font-bold text-white">Q</span>
            Qora
          </Link>
        </div>

        <div className="flex flex-1 items-center gap-3">
          <div className="relative max-w-xl flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#626f86]" />
            <input
              className="h-9 w-full rounded border border-[#8590a2] bg-white pl-9 pr-3 text-sm outline-none focus:border-[#0c66e4] focus:ring-1 focus:ring-[#0c66e4]"
              placeholder={isProjectPage ? 'Search board' : 'Search'}
            />
          </div>
          <button className="inline-flex h-9 items-center gap-2 rounded bg-[#0c66e4] px-3 text-sm font-semibold text-white hover:bg-[#0055cc]">
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>

        <div className="ml-4 flex items-center gap-2">
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f1f2f4]" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f1f2f4]" aria-label="Help">
            <CircleHelp className="h-4 w-4" />
          </button>
          <button className="grid h-8 w-8 place-items-center rounded hover:bg-[#f1f2f4]" aria-label="Settings">
            <Settings className="h-4 w-4" />
          </button>
          <button
            onClick={logout}
            className="grid h-8 w-8 place-items-center rounded-full bg-[#00875a] text-sm font-bold text-white"
            title="Logout"
          >
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </button>
        </div>
      </header>

      <aside className="fixed bottom-0 left-0 top-14 z-30 w-60 overflow-y-auto border-r border-[#dfe1e6] bg-[#fafbfc] px-3 py-4">
        <div className="space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              className="flex h-8 w-full items-center gap-3 rounded px-2 text-left text-sm text-[#172b4d] hover:bg-[#ebecf0]"
            >
              <item.icon className="h-4 w-4 text-[#44546f]" />
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-5 border-t border-[#dfe1e6] pt-4">
          <div className="mb-2 flex items-center justify-between px-2 text-xs font-semibold uppercase text-[#626f86]">
            Spaces
            <Plus className="h-4 w-4" />
          </div>
          <Link
            to="/"
            className="flex h-9 items-center gap-2 rounded bg-[#e9f2ff] px-2 text-sm font-medium text-[#0c66e4]"
          >
            <span className="grid h-6 w-6 place-items-center rounded bg-[#ffab00] text-xs font-bold text-white">Q</span>
            Qora Workspace
          </Link>
        </div>

        <div className="mt-5 space-y-1 border-t border-[#dfe1e6] pt-4">
          <button className="flex h-8 w-full items-center gap-3 rounded px-2 text-sm hover:bg-[#ebecf0]">
            <Filter className="h-4 w-4 text-[#44546f]" />
            Filters
          </button>
          <button className="flex h-8 w-full items-center gap-3 rounded px-2 text-sm hover:bg-[#ebecf0]">
            <LayoutDashboard className="h-4 w-4 text-[#44546f]" />
            Dashboards
          </button>
          <button className="flex h-8 w-full items-center gap-3 rounded px-2 text-sm hover:bg-[#ebecf0]">
            <Users className="h-4 w-4 text-[#44546f]" />
            Teams
          </button>
        </div>
      </aside>

      <main className="min-h-screen pl-60 pt-14">{children}</main>
    </div>
  );
};
