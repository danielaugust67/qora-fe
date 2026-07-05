import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, CalendarDays, Check, FileText, FormInput, LayoutGrid, ListTodo, GitCommit, MoreHorizontal, Share2, Users, Zap, Bug as BugIcon, CheckSquare, Star } from 'lucide-react';
import { navigationApi } from '@/features/navigation/api/navigationApi';
import { motion, AnimatePresence } from 'framer-motion';

interface ProjectChromeProps {
  projectId: string;
  title?: string;
  children: React.ReactNode;
}

const tabs = [
  { label: 'Summary', icon: BookOpen, path: 'summary' },
  { label: 'Backlog', icon: ListTodo, path: 'backlog' },
  { label: 'Board', icon: LayoutGrid, path: 'board' },
  { label: 'Calendar', icon: CalendarDays, path: 'calendar' },
  { label: 'Timeline', icon: GitCommit, path: 'timeline' },
  { label: 'Docs', icon: FileText, path: 'docs' },
  { label: 'Forms', icon: FormInput, path: 'forms' },
  { label: 'Test Case', icon: Zap, path: 'qa' },
  { label: 'Bugs', icon: BugIcon, path: 'bugs' },
  { label: 'UAT', icon: CheckSquare, path: 'uat' },
];

export const ProjectChrome = ({ projectId, title = 'Qora Project', children }: ProjectChromeProps) => {
  const location = useLocation();
  const queryClient = useQueryClient();
  const [membersOpen, setMembersOpen] = useState(false);
  const [automationOpen, setAutomationOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [copied, setCopied] = useState(false);
  
  const { data: members = [] } = useQuery({
    queryKey: ['project-members', projectId],
    queryFn: () => navigationApi.getProjectMembers(projectId),
    enabled: !!projectId,
  });
  
  const { data: automation } = useQuery({
    queryKey: ['automation-settings', projectId],
    queryFn: () => navigationApi.getAutomationSettings(projectId),
    enabled: !!projectId,
  });
  
  const createMemberMutation = useMutation({
    mutationFn: (data: { email: string; role: string }) => navigationApi.createProjectMember(projectId, data),
    onSuccess: () => {
      setInviteEmail('');
      setInviteRole('member');
      queryClient.invalidateQueries({ queryKey: ['project-members', projectId] });
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to invite member. Make sure they are registered.');
    }
  });
  
  const deleteMemberMutation = useMutation({
    mutationFn: (memberId: string) => navigationApi.deleteProjectMember(projectId, memberId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-members', projectId] }),
  });
  
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) => navigationApi.updateProjectMemberRole(projectId, memberId, role),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['project-members', projectId] }),
  });
  
  const updateAutomationMutation = useMutation({
    mutationFn: (data: { auto_move_done: boolean; auto_bug_notify: boolean }) =>
      navigationApi.updateAutomationSettings(projectId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['automation-settings', projectId] }),
  });

  const copyShareLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="bg-background border-b border-border/40">
      <div className="px-6 py-4">
        <div className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer mb-2 inline-block">
          Projects / {title}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
            <button className="grid h-7 w-7 place-items-center rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
              <Star className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <button 
                onClick={() => {
                  setAutomationOpen(!automationOpen);
                  setMembersOpen(false);
                  setMoreOpen(false);
                }}
                className="linear-button inline-flex h-8 items-center gap-2 px-3"
              >
                <Zap className="h-3.5 w-3.5" />
                Automation
              </button>
              <AnimatePresence>
                {automationOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-40 w-80 rounded-xl border border-white/20 glass p-4 text-sm shadow-2xl"
                  >
                    <div className="mb-3 font-semibold">Automation</div>
                    <label className="flex items-center justify-between rounded-md bg-muted/40 p-3 hover:bg-muted/60 transition-colors">
                      <span className="text-foreground/90 font-medium">Move task to Done when all tests pass</span>
                      <input
                        type="checkbox"
                        checked={automation?.auto_move_done ?? true}
                        onChange={(event) =>
                          updateAutomationMutation.mutate({
                            auto_move_done: event.target.checked,
                            auto_bug_notify: automation?.auto_bug_notify ?? false,
                          })
                        }
                        className="accent-primary"
                      />
                    </label>
                    <label className="mt-2 flex items-center justify-between rounded-md bg-muted/40 p-3 hover:bg-muted/60 transition-colors">
                      <span className="text-foreground/90 font-medium">Notify team when critical bug is reported</span>
                      <input
                        type="checkbox"
                        checked={automation?.auto_bug_notify ?? false}
                        onChange={(event) =>
                          updateAutomationMutation.mutate({
                            auto_move_done: automation?.auto_move_done ?? true,
                            auto_bug_notify: event.target.checked,
                          })
                        }
                        className="accent-primary"
                      />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative ml-2">
              <button 
                onClick={() => {
                  setMembersOpen(!membersOpen);
                  setMoreOpen(false);
                  setAutomationOpen(false);
                }}
                className="linear-button inline-flex h-8 items-center gap-2 px-3"
              >
                <Users className="h-3.5 w-3.5" />
                Members
                <span className="grid h-4 w-4 place-items-center rounded-full bg-border/60 text-[10px] font-bold">
                  {members.length}
                </span>
              </button>
              <AnimatePresence>
                {membersOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-10 z-40 w-80 rounded-xl border border-white/20 glass p-4 text-sm shadow-2xl"
                  >
                    <div className="mb-3 font-semibold">Project members</div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        <input
                          value={inviteEmail}
                          onChange={(event) => setInviteEmail(event.target.value)}
                          className="h-9 flex-1 rounded-md border border-border/50 bg-background/50 px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          placeholder="Invite by email"
                        />
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value)}
                          className="h-9 rounded-md border border-border/50 bg-background/50 px-2 outline-none focus:border-primary transition-all text-xs"
                        >
                          <option value="owner">Owner</option>
                          <option value="admin">Admin</option>
                          <option value="member">Member</option>
                          <option value="viewer">Viewer</option>
                        </select>
                        <button
                          onClick={() => {
                            if (!inviteEmail.trim()) return;
                            createMemberMutation.mutate({ email: inviteEmail.trim(), role: inviteRole });
                          }}
                          disabled={createMemberMutation.isPending}
                          className="linear-button-primary px-3 disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                      {members.map((member) => (
                        <div key={member.id} className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2.5">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[#00875a] to-[#005c3d] text-xs font-bold text-white shadow-sm ring-1 ring-white/20">
                              {member.name[0]?.toUpperCase()}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate font-medium text-[13px]">{member.name}</div>
                              <div className="truncate text-[11px] text-muted-foreground">{member.email}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <select
                              value={member.role}
                              onChange={(e) => updateRoleMutation.mutate({ memberId: member.id, role: e.target.value })}
                              className="h-7 rounded border border-border/50 bg-background/50 px-1 text-xs outline-none hover:border-primary/50 transition-colors"
                            >
                              <option value="owner">Owner</option>
                              <option value="admin">Admin</option>
                              <option value="member">Member</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <button
                              onClick={() => deleteMemberMutation.mutate(member.id)}
                              className="rounded px-2 py-1 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                      {members.length === 0 && <div className="rounded-lg bg-muted/40 p-3 text-muted-foreground text-center">No members yet.</div>}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex gap-2 ml-2">
              <button
                onClick={copyShareLink}
                className="linear-button inline-flex h-8 items-center gap-2 px-2.5"
                aria-label="Share"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#00875a]" /> : <Share2 className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : ''}
              </button>
              
              <div className="relative">
                <button
                  onClick={() => {
                    setMoreOpen((open) => !open);
                    setMembersOpen(false);
                    setAutomationOpen(false);
                  }}
                  className="linear-button grid h-8 w-8 place-items-center px-0"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                <AnimatePresence>
                  {moreOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 z-40 w-48 rounded-lg border border-white/20 glass py-1 text-sm shadow-2xl"
                    >
                      <Link to={`/projects/${projectId}/summary`} className="block px-3 py-2 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors">Project summary</Link>
                      <Link to={`/projects/${projectId}/docs`} className="block px-3 py-2 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors">Project docs</Link>
                      <Link to={`/projects/${projectId}/forms`} className="block px-3 py-2 text-foreground/80 hover:bg-black/5 dark:hover:bg-white/10 hover:text-foreground transition-colors">Request forms</Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
          </div>
        </div>

        <nav className="mt-4 flex h-10 items-end gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const active = location.pathname.endsWith(`/${tab.path}`);
            const className = `flex h-10 items-center gap-2 border-b-2 px-3 text-[13px] font-medium transition-colors ${
              active
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-foreground/30'
            }`;

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
