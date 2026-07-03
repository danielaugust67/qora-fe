import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { useAuthStore } from './features/auth/store/authStore'
import { WorkspaceDashboard } from './features/workspace/components/WorkspaceDashboard'
import { KanbanBoard } from './features/board/components/KanbanBoard'
import { SprintBacklog } from './features/sprint/components/SprintBacklog'
import { QADashboard } from './features/qa/components/QADashboard'
import { JiraLayout } from './layouts/JiraLayout'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  return (
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
                    <Route path="/projects/:projectId/board" element={<KanbanBoard />} />
                    <Route path="/projects/:projectId/backlog" element={<SprintBacklog />} />
                    <Route path="/projects/:projectId/qa" element={<QADashboard />} />
                  </Routes>
                </JiraLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
