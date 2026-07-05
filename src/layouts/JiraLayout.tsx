import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
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
  HelpCircle,
  PanelLeft,
} from 'lucide-react';
import { useAuthStore } from '@/features/auth/store/authStore';
import { NotificationBell } from '@/features/notifications/components/NotificationBell';
import { CommandMenu } from '@/features/navigation/components/CommandMenu';

interface JiraLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: 'For you', icon: Home, path: '/' },
  { label: 'Recent', icon: ClipboardList, path: '/recent' },
  { label: 'Starred', icon: Star, path: '/starred' },
  { label: 'Apps', icon: Grid2X2, path: '/apps' },
  { label: 'Plans', icon: Gauge, path: '/plans' },
];

export const JiraLayout = ({ children }: JiraLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  const logout = useAuthStore((state) => state.logout);
  const isProjectPage = location.pathname.startsWith('/projects/');
  const projectId = isProjectPage ? location.pathname.split('/')[2] : null;
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const handleCreate = () => {
    if (projectId) {
      navigate(`/projects/${projectId}/backlog`);
      return;
    }
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border/50 bg-background/80 backdrop-blur-xl px-4">
        <div className="flex w-56 items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="grid h-8 w-8 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            aria-label="Toggle sidebar"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:text-primary transition-colors">
            <span className="grid h-6 w-6 place-items-center rounded-[6px] bg-gradient-to-br from-primary to-slate-900 text-xs font-bold text-white shadow-sm ring-1 ring-white/20">Q</span>
            Qora
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <div className="flex items-center gap-3 pr-2">
            <div className="relative hidden md:block">
              <Search className="absolute left-2 top-1.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                className="h-7 w-48 rounded-full border border-border/40 bg-muted/30 pl-8 pr-3 text-xs placeholder:text-muted-foreground focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
              />
            </div>

            <NotificationBell />

            <div className="relative">
              <button
                onClick={() => setHelpOpen(!helpOpen)}
                className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${helpOpen ? 'bg-black/10 dark:bg-white/20' : 'hover:bg-black/5 dark:hover:bg-white/10'}`}
              >
                <HelpCircle className={`h-4 w-4 transition-colors ${helpOpen ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`} />
              </button>

              {helpOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setHelpOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-border/50 bg-background/80 p-3 shadow-xl backdrop-blur-xl z-50">
                    <h4 className="font-semibold text-sm mb-2">Help & Resources</h4>
                    <div className="space-y-1">
                      <a href="#" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors">
                        <CircleHelp className="h-4 w-4 text-muted-foreground" />
                        Qora Documentation
                      </a>
                      <a href="#" className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted transition-colors">
                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                        Keyboard Shortcuts
                      </a>
                    </div>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => navigate('/settings')}
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
              <Settings className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>

            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="ml-1 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-primary to-slate-900 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform hover:scale-105"
              >
                {user?.name?.[0]?.toUpperCase()}
              </button>

              {profileOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-border/50 bg-background/80 p-2 shadow-xl backdrop-blur-xl z-50">
                    <div className="px-2 py-2.5">
                      <p className="text-sm font-semibold">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                    <div className="h-px bg-border/50 my-1" />
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        navigate('/settings');
                      }}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Profile Settings
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-md px-2 py-1.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={handleCreate}
            className="linear-button-primary inline-flex h-9 items-center gap-2 px-3"
          >
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>


      </header>

      <aside className={`fixed bottom-0 left-0 top-14 z-30 w-60 overflow-y-auto border-r border-border/40 bg-background/50 px-3 py-4 backdrop-blur-md transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex h-8 w-full items-center gap-3 rounded-md px-2 text-left text-[13px] font-medium transition-colors ${location.pathname === item.path ? 'bg-primary/10 text-primary' : 'text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10'
                }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-5 border-t border-border/40 pt-4">
          <div className="mb-2 flex items-center justify-between px-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Spaces
            <button className="hover:text-foreground transition-colors"><Plus className="h-3.5 w-3.5" /></button>
          </div>
          <Link
            to="/"
            className="flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          >
            <span className="grid h-5 w-5 place-items-center rounded bg-gradient-to-br from-primary to-slate-900 text-[10px] font-bold text-white shadow-sm ring-1 ring-white/20">Q</span>
            Qora Workspace
          </Link>
        </div>

        <div className="mt-5 space-y-0.5 border-t border-border/40 pt-4">
          <Link to="/filters" className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-[13px] font-medium text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Filter className="h-4 w-4" />
            Filters
          </Link>
          <Link to="/dashboards" className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-[13px] font-medium text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            Dashboards
          </Link>
          <Link to="/teams" className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-[13px] font-medium text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Users className="h-4 w-4" />
            Teams
          </Link>
          <Link to="/settings" className="flex h-8 w-full items-center gap-3 rounded-md px-2 text-[13px] font-medium text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </div>
      </aside>

      <main className={`min-h-screen pt-14 transition-all duration-300 ${sidebarOpen ? 'pl-60' : 'pl-0'}`}>{children}</main>
      <CommandMenu />
    </div>
  );
};


