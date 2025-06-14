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
import { useEffect } from 'react'
import { Analytics } from "@vercel/analytics/next"

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }
  return <>{children}</>;
};

function App() {

  useEffect(() => {
    const checkVersion = async () => {
      const res = await fetch('/version.txt', { cache: 'no-store' });
      const latestVersion = await res.text();
      if (latestVersion !== localStorage.getItem('app_version')) {
        localStorage.setItem('app_version', latestVersion);
        window.location.reload(); // Force reload to get new build
      }
    };
  
    checkVersion();
    const interval = setInterval(checkVersion, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <AuthProvider>
      <Analytics />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}

export default App
