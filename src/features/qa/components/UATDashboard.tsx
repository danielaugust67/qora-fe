import { useParams } from 'react-router-dom';
import { ProjectChrome } from '@/features/project/components/ProjectChrome';
import { Download, FileCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import apiClient from '@/services/apiClient';

export function UATDashboard() {
  const { projectId } = useParams<{ projectId: string }>();

  const handleExportUAT = async () => {
    try {
      const response = await apiClient.get(`/projects/${projectId}/export/uat`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'UAT_Document.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export UAT document:', error);
      alert('Failed to export UAT document. Please try again.');
    }
  };

  return (
    <ProjectChrome projectId={projectId!}>
      <div className="flex h-full flex-col bg-[#f4f5f7]">
        {/* Header */}
        <div className="border-b border-[#dfe1e6] bg-white px-8 py-6">
          <h1 className="text-2xl font-semibold text-[#172b4d]">User Acceptance Testing (UAT)</h1>
          <p className="mt-2 text-sm text-[#626f86]">
            Download the official UAT Document containing all Test Cases and Bug Reports for final review and client sign-off.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          <div className="mx-auto max-w-3xl rounded-md border border-[#dfe1e6] bg-white p-8 shadow-sm">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="mb-6 rounded-full bg-[#e9f2ff] p-6">
                <FileCheck className="h-16 w-16 text-primary" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#172b4d]">Ready for Sign-off</h2>
              <p className="mb-8 max-w-md text-[#626f86]">
                The UAT document is generated in real-time. It includes the latest statuses of all executed test cases and any reported bugs.
              </p>

              <button
                onClick={handleExportUAT}
                className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
              >
                <Download className="h-5 w-5" />
                Download UAT Document (.xlsx)
              </button>
            </div>

            <hr className="my-8 border-[#dfe1e6]" />

            <div>
              <h3 className="mb-4 font-semibold text-[#172b4d]">What's included in this document?</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-[#172b4d]">Test Cases Sheet</p>
                    <p className="text-sm text-[#626f86]">Comprehensive list of all test scenarios, expected results, and their final PASS/FAIL status.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-[#172b4d]">Bug Reports Sheet</p>
                    <p className="text-sm text-[#626f86]">Detailed log of all anomalies found during testing, including severity, priority, and steps to reproduce.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProjectChrome>
  );
}
