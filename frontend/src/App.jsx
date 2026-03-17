import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import Register from './pages/Register'
import Chat from './pages/Chat'
import Onboarding from './pages/Onboarding'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { isAuthenticated, user } = useAuthStore()

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <Login />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/onboarding" /> : <Register />} 
        />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {user?.onboarding_completed ? <Navigate to="/chat" /> : <Onboarding />}
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              {!user?.onboarding_completed ? <Navigate to="/onboarding" /> : <Chat />}
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/chat" />} />
      </Routes>
    </Router>
  )
}

export default App
