import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { AuthLayout } from './layouts/AuthLayout'
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { useAuthStore } from './features/auth/store/authStore'
import { WorkspaceDashboard } from './features/workspace/components/WorkspaceDashboard'
import { KanbanBoard } from './features/board/components/KanbanBoard'
import { SprintBacklog } from './features/sprint/components/SprintBacklog'
import { QADashboard } from './features/qa/components/QADashboard'
import { BugDashboard } from './features/bug/components/BugDashboard'
import { UATDashboard } from './features/qa/components/UATDashboard'
import { JiraLayout } from './layouts/JiraLayout'
import {
  ProjectCalendarPage,
  ProjectDocsPage,
  ProjectFormsPage,
  ProjectSummaryPage,
  ProjectTimelinePage,
} from './features/project/components/ProjectPages'
import {
  AppsPage,
  DashboardsPage,
  FiltersPage,
  PlansPage,
  RecentPage,
  SettingsPage,
  StarredPage,
  TeamsPage,
} from './features/navigation/components/WorkspacePages'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
      <div className="min-h-screen bg-background font-sans antialiased text-foreground">
        <Routes>
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
          </Route>

          {/* Protected Routes */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <JiraLayout>
                  <Routes>
                    <Route path="/" element={<WorkspaceDashboard />} />
                    <Route path="/recent" element={<RecentPage />} />
                    <Route path="/starred" element={<StarredPage />} />
                    <Route path="/apps" element={<AppsPage />} />
                    <Route path="/plans" element={<PlansPage />} />
                    <Route path="/filters" element={<FiltersPage />} />
                    <Route path="/dashboards" element={<DashboardsPage />} />
                    <Route path="/teams" element={<TeamsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/projects/:projectId/summary" element={<ProjectSummaryPage />} />
                    <Route path="/projects/:projectId/board" element={<KanbanBoard />} />
                    <Route path="/projects/:projectId/backlog" element={<SprintBacklog />} />
                    <Route path="/projects/:projectId/calendar" element={<ProjectCalendarPage />} />
                    <Route path="/projects/:projectId/timeline" element={<ProjectTimelinePage />} />
                    <Route path="/projects/:projectId/docs" element={<ProjectDocsPage />} />
                    <Route path="/projects/:projectId/forms" element={<ProjectFormsPage />} />
                    <Route path="/projects/:projectId/qa" element={<QADashboard />} />
                    <Route path="/projects/:projectId/bugs" element={<BugDashboard />} />
                    <Route path="/projects/:projectId/uat" element={<UATDashboard />} />
                  </Routes>
                </JiraLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
      </Router>
    </ErrorBoundary>
  )
}

export default App
