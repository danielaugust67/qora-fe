export interface Task {
  id: string;
  project_id: string;
  sprint_id?: string;
  title: string;
  description: string;
  status: string;
  type: string;
  priority: string;
  assignee_id?: string;
  reporter_id: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface TaskAttachment {
  id: string;
  task_id: string;
  user_id: string;
  file_url: string;
  file_name: string;
  created_at: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
}
