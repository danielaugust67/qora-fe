import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import { AuthLayout } from './layouts/AuthLayout'
import { LoginForm } from './features/auth/components/LoginForm'
import { RegisterForm } from './features/auth/components/RegisterForm'
import { useAuthStore } from './features/auth/store/authStore'
import { WorkspaceDashboard } from './features/workspace/components/WorkspaceDashboard'
import { KanbanBoard } from './features/board/components/KanbanBoard'
import { SprintBacklog } from './features/sprint/components/SprintBacklog'
import { QADashboard } from './features/qa/components/QADashboard'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = useAuthStore((state) => state.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function App() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)

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
                <div className="flex min-h-screen flex-col">
                  <header className="sticky top-0 z-40 border-b bg-background px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg">
                      <span className="bg-primary text-primary-foreground p-1 rounded-md text-xs">Q</span>
                      <Link to="/">Qora</Link>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">Hello, {user?.name}</span>
                      <button 
                        onClick={logout}
                        className="text-sm font-medium hover:underline text-destructive"
                      >
                        Logout
                      </button>
                    </div>
                  </header>
                  <main className="flex-1 p-8 container mx-auto max-w-7xl">
                    <Routes>
                      <Route path="/" element={<WorkspaceDashboard />} />
                      <Route path="/projects/:projectId/board" element={<KanbanBoard />} />
                      <Route path="/projects/:projectId/backlog" element={<SprintBacklog />} />
                      <Route path="/projects/:projectId/qa" element={<QADashboard />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
