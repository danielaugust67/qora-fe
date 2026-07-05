import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ProjectChrome } from './ProjectChrome';
import { taskApi } from '@/features/task/api/taskApi';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { qaApi } from '@/features/qa/api/qaApi';
import { bugApi } from '@/features/bug/api/bugApi';
import { navigationApi } from '@/features/navigation/api/navigationApi';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts';

const statusColumns = ['TODO', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'DONE'];
const COLORS = ['#5e6ad2', '#26b5ce', '#ff991f', '#ff5630', '#36B37E'];

const Metric = ({ label, value }: { label: string; value: number }) => (
  <div className="rounded border border-[#dfe1e6] bg-white p-4">
    <div className="text-sm text-[#626f86]">{label}</div>
    <div className="mt-2 text-3xl font-semibold text-[#172b4d]">{value}</div>
  </div>
);

export const ProjectSummaryPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: () => taskApi.getTasks(projectId!),
    enabled: !!projectId,
  });
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints(projectId!),
    enabled: !!projectId,
  });
  const { data: bugs = [] } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: () => bugApi.getProjectBugs(projectId!),
    enabled: !!projectId,
  });
  const { data: testCases = [] } = useQuery({
    queryKey: ['test-cases', projectId],
    queryFn: () => qaApi.getTestCases(projectId!),
    enabled: !!projectId,
  });
  const { data: dashboard } = useQuery({
    queryKey: ['project-dashboard', projectId],
    queryFn: () => navigationApi.getDashboardSummary(projectId!),
    enabled: !!projectId,
  });

  const doneTasks = tasks.filter((task) => task.status === 'DONE').length;
  const activeSprint = sprints.find((sprint) => sprint.status === 'ACTIVE');
  const openBugs = bugs.filter((bug) => !['CLOSED', 'REJECTED'].includes(bug.status)).length;

  const bugSeverityData = useMemo(() => {
    const counts = bugs.reduce((acc, bug) => {
      acc[bug.severity] = (acc[bug.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bugs]);

  const taskStatusData = useMemo(() => {
    return statusColumns.map(status => ({
      name: status.replace('_', ' '),
      count: tasks.filter(t => t.status === status).length
    }));
  }, [tasks]);

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="space-y-6 bg-white px-8 py-6">
        <div>
          <h2 className="text-2xl font-semibold text-[#172b4d]">Summary</h2>
          <p className="mt-1 text-sm text-[#626f86]">{activeSprint ? activeSprint.name : 'No active sprint'}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Metric label="Tasks" value={dashboard?.total_tasks ?? tasks.length} />
          <Metric label="Done" value={dashboard?.completed_tasks ?? doneTasks} />
          <Metric label="Open bugs" value={dashboard?.open_bugs ?? openBugs} />
          <Metric label="Failed tests" value={dashboard?.failed_tests ?? testCases.filter((testCase) => testCase.status === 'FAILED').length} />
        </div>
        <div className="rounded border border-[#dfe1e6] bg-white">
          <div className="border-b border-[#dfe1e6] px-4 py-3 text-sm font-semibold">Work by status</div>
          <div className="grid gap-3 p-4 md:grid-cols-5">
            {statusColumns.map((status) => (
              <div key={status} className="rounded bg-[#f7f8f9] p-3">
                <div className="text-xs font-semibold uppercase text-[#626f86]">{status.replace('_', ' ')}</div>
                <div className="mt-2 text-2xl font-semibold">{tasks.filter((task) => task.status === status).length}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded border border-[#dfe1e6] bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold">Task Distribution</h3>
            <div className="h-[250px] w-full">
              {tasks.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={taskStatusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" fill="#5e6ad2" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#626f86]">No tasks found</div>
              )}
            </div>
          </div>
          <div className="rounded border border-[#dfe1e6] bg-white p-4">
            <h3 className="mb-4 text-sm font-semibold">Bug Severity Distribution</h3>
            <div className="h-[250px] w-full">
              {bugSeverityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={bugSeverityData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {bugSeverityData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#626f86]">No bugs found</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProjectChrome>
  );
};
