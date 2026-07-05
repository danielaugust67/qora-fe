import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectChrome } from './ProjectChrome';

export const ProjectDocsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [title, setTitle] = useState('Release notes');
  const [content, setContent] = useState('');
  const savedAt = useMemo(() => new Date().toLocaleTimeString(), [content]);

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="space-y-4 bg-white px-8 py-6">
        <h2 className="text-2xl font-semibold text-[#172b4d]">Docs</h2>
        <div className="rounded border border-[#dfe1e6] bg-white p-4">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="h-10 w-full rounded border border-[#dfe1e6] px-3 text-lg font-semibold outline-none focus:border-primary"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="mt-4 min-h-[280px] w-full rounded border border-[#dfe1e6] p-3 text-sm outline-none focus:border-primary"
            placeholder="Write project notes"
          />
          <div className="mt-3 text-xs text-[#626f86]">Draft updated {savedAt}</div>
        </div>
      </div>
    </ProjectChrome>
  );
};
