export interface UserSettings {
  user_id: string;
  compact_rows: boolean;
  email_digest: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  detail: string;
  is_read: boolean;
  created_at: string;
}

export interface NavItem {
  id: string;
  user_id: string;
  title: string;
  path: string;
  type: string;
  created_at: string;
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  query: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface AutomationSettings {
  project_id: string;
  user_id: string;
  auto_move_done: boolean;
  auto_bug_notify: boolean;
  updated_at: string;
}

export interface DashboardSummary {
  total_tasks: number;
  completed_tasks: number;
  open_bugs: number;
  failed_tests: number;
  active_sprints: number;
}

export interface AppInfo {
  id: string;
  title: string;
  description: string;
  status: string;
}

export interface PlanInfo {
  id: string;
  title: string;
  description: string;
  status: string;
}
