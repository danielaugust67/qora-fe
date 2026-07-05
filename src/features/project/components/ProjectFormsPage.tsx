import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectChrome } from './ProjectChrome';

export const ProjectFormsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [requestTitle, setRequestTitle] = useState('');
  const [requestType, setRequestType] = useState('Bug report');
  const [requests, setRequests] = useState<Array<{ title: string; type: string }>>([]);

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="space-y-4 bg-white px-8 py-6">
        <h2 className="text-2xl font-semibold text-[#172b4d]">Forms</h2>
        <div className="rounded border border-[#dfe1e6] bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_180px_auto]">
            <input
              value={requestTitle}
              onChange={(event) => setRequestTitle(event.target.value)}
              className="h-10 rounded border border-[#dfe1e6] px-3 outline-none focus:border-primary"
              placeholder="Request title"
            />
            <select
              value={requestType}
              onChange={(event) => setRequestType(event.target.value)}
              className="h-10 rounded border border-[#dfe1e6] px-3"
            >
              <option>Bug report</option>
              <option>Feature request</option>
              <option>QA request</option>
            </select>
            <button
              onClick={() => {
                if (!requestTitle.trim()) return;
                setRequests((current) => [...current, { title: requestTitle, type: requestType }]);
                setRequestTitle('');
              }}
              className="h-10 rounded bg-primary px-4 text-sm font-semibold text-white"
            >
              Add
            </button>
          </div>
          <div className="mt-4 divide-y divide-[#dfe1e6] rounded border border-[#dfe1e6]">
            {requests.map((request, index) => (
              <div key={`${request.title}-${index}`} className="flex items-center justify-between px-3 py-2 text-sm">
                <span>{request.title}</span>
                <span className="rounded bg-[#dfe1e6] px-2 py-0.5 text-xs font-semibold">{request.type}</span>
              </div>
            ))}
            {requests.length === 0 && <div className="p-4 text-sm text-[#626f86]">No requests yet.</div>}
          </div>
        </div>
      </div>
    </ProjectChrome>
  );
};
