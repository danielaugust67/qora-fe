export interface Bug {
  id: string;
  project_id: string;
  task_id: string;
  test_case_id?: string;
  reporter_id: string;
  assignee_id?: string;
  title: string;
  description: string;
  severity: string;
  priority: string;
  status: string;
  environment: string;
  browser: string;
  device: string;
  steps_to_reproduce: string;
  expected_result: string;
  actual_result: string;
  screenshot_url: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBugData {
  test_case_id?: string;
  title: string;
  description?: string;
  severity?: string;
  priority?: string;
  environment?: string;
  browser?: string;
  device?: string;
  steps_to_reproduce?: string;
  expected_result?: string;
  actual_result?: string;
  screenshot?: File;
}
