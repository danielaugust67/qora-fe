import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { sprintApi } from '@/features/sprint/api/sprintApi';
import { ProjectChrome } from './ProjectChrome';

const EmptyPanel = ({ text }: { text: string }) => (
  <div className="rounded border border-dashed border-[#dfe1e6] p-6 text-center text-sm text-[#626f86]">{text}</div>
);

export const ProjectTimelinePage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: () => sprintApi.getSprints(projectId!),
    enabled: !!projectId,
  });

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="space-y-5 bg-white px-8 py-6">
        <h2 className="text-2xl font-semibold text-[#172b4d]">Timeline</h2>
        <div className="rounded border border-[#dfe1e6] bg-white p-4">
          <div className="space-y-4">
            {sprints.map((sprint, index) => (
              <div key={sprint.id} className="grid grid-cols-[120px_1fr] items-center gap-4">
                <div className="text-sm font-medium text-[#626f86]">Sprint {index + 1}</div>
                <div className="rounded bg-[#e9f2ff] px-4 py-3 text-sm font-semibold text-primary">
                  {sprint.name}
                </div>
              </div>
            ))}
            {sprints.length === 0 && <EmptyPanel text="No timeline items." />}
          </div>
        </div>
      </div>
    </ProjectChrome>
  );
};
