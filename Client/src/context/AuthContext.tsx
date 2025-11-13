import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  user: { email: string; role: string } | null;
  login: (token: string, user: { email: string; role: string }) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ email: string; role: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set up apiClient default headers
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Verify token and get user info
      apiClient.get('/api/auth/me')
        .then(response => {
          const userData = response.data.user;
          if (userData.role === 'admin') {
            setIsAuthenticated(true);
            setUser(userData);
          } else {
            // If user is not admin, clear everything
            localStorage.removeItem('token');
            delete apiClient.defaults.headers.common['Authorization'];
          }
        })
        .catch(() => {
          // If token is invalid, clear everything
          localStorage.removeItem('token');
          delete apiClient.defaults.headers.common['Authorization'];
        });
    }
  }, []);

  const login = (token: string, userData: { email: string; role: string }) => {
    localStorage.setItem('token', token);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 