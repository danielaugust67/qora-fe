export interface Workspace {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateWorkspaceData {
  name: string;
  description?: string;
}
