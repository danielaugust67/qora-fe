export interface TestStep {
  id: string;
  test_case_id: string;
  step_number: number;
  action: string;
  expected_result: string;
}

export interface TestExecution {
  id: string;
  test_case_id: string;
  executor_id: string;
  status: string; // PASSED, FAILED, BLOCKED
  actual_result: string;
  notes: string;
  executed_at: string;
}

export interface TestCase {
  id: string;
  project_id: string;
  task_id: string;
  title: string;
  description: string;
  preconditions: string;
  priority: string;
  expected_result: string;
  status: string;
  testing_type?: string;
  test_data?: string;
  actual_result?: string;
  tester?: string;
  execution_date?: string;
  type_of_testing?: string;
  notes?: string;
  phase?: string;
  attachment_url?: string;
  created_at: string;
  updated_at: string;
  steps?: TestStep[];
  executions?: TestExecution[];
}

export interface CreateTestCaseData {
  title: string;
  description?: string;
  preconditions?: string;
  priority?: string;
  expected_result?: string;
  testing_type?: string;
  test_data?: string;
  actual_result?: string;
  tester?: string;
  type_of_testing?: string;
  notes?: string;
  phase?: string;
  attachment_url?: string;
  steps: {
    action: string;
    expected_result?: string;
  }[];
}

export interface ExecuteTestCaseData {
  status: string;
  actual_result?: string;
  notes?: string;
}
