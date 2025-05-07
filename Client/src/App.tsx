import './App.css'
import Header from './components/Header'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import ThankYou from './pages/ThankYou'
import GlobalStyle from './GlobalStyle'
import Terms from './pages/Terms'
import AdminLogin from './components/admin/AdminLogin'
import AdminDashboard from './components/admin/AdminDashboard'
import { AuthProvider, useAuth } from './context/AuthContext'

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <GlobalStyle />
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <Home />
          </>
        } />
        <Route path="/thank-you" element={
          <>
            <Header />
            <ThankYou />
          </>
        } />
        <Route path="/terms" element={
          <>
            <Header />
            <Terms />
          </>
        } />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard/*" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>
    </AuthProvider>
  )
}

export default App
