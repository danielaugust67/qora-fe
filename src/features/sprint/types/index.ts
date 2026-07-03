export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  goal: string;
  start_date?: string;
  end_date?: string;
  status: string; // PLANNED, ACTIVE, COMPLETED
  created_at: string;
  updated_at: string;
}

export interface CreateSprintData {
  name: string;
  goal?: string;
  start_date?: string;
  end_date?: string;
}

export type UpdateSprintData = CreateSprintData;
