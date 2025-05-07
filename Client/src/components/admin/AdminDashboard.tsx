import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminCalendar from './pages/AdminCalendar';
import Services from './pages/Services';
import Barbers from './pages/Barbers';
import Saloons from './pages/Saloons';

const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #fff;
`;

const MainContent = styled.main`
  flex: 1;
`;

const Header = styled.header<{ isSidebarOpen: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  padding-bottom: 1rem;
  padding-right: 2rem;
  padding-left: ${({ isSidebarOpen }) => (isSidebarOpen ? '2rem' : '70px')};
  background-color: #2a2a2a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: padding-left 0.3s;
`;

const Title = styled.h1`
  color: #fff;
  margin: 0 0.5em;

`;

const LogoutButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: #C19B76;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #b08a65;
  }
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
`;

const Card = styled.div`
  background-color: #2a2a2a;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CardTitle = styled.h3`
  color: #C19B76;
  margin-top: 0;
  margin-bottom: 1rem;
`;

const Stat = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #fff;
`;

interface DashboardStats {
  totalAppointments: number;
  totalBarbers: number;
  totalServices: number;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalAppointments: 0,
    totalBarbers: 0,
    totalServices: 0
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Fetch dashboard data
    const fetchDashboardData = async () => {
      try {
        const [appointments, barbers, services] = await Promise.all([
          axios.get('/api/appointments'),
          axios.get('/api/barbers'),
          axios.get('/api/services')
        ]);

        setStats({
          totalAppointments: appointments.data.length,
          totalBarbers: barbers.data.length,
          totalServices: services.data.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        if ((error as AxiosError).response?.status === 401) {
          logout();
          navigate('/admin');
        }
      }
    };

    fetchDashboardData();
  }, [navigate, logout]);

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <Container>
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <MainContent>
        <Header isSidebarOpen={isSidebarOpen}>
          <Title>Админ Панел</Title>
          <LogoutButton onClick={handleLogout}>Изход</LogoutButton>
        </Header>

        <Routes>
          <Route path="/" element={
            <DashboardGrid>
              <Card>
                <CardTitle>Общо Записани Часове</CardTitle>
                <Stat>{stats.totalAppointments}</Stat>
              </Card>
              <Card>
                <CardTitle>Общо Фризьори</CardTitle>
                <Stat>{stats.totalBarbers}</Stat>
              </Card>
              <Card>
                <CardTitle>Общо Услуги</CardTitle>
                <Stat>{stats.totalServices}</Stat>
              </Card>
            </DashboardGrid>
          } />
          <Route path="/calendar" element={<AdminCalendar />} />
          <Route path="/services" element={<Services />} />
          <Route path="/barbers" element={<Barbers />} />
          <Route path="/saloons" element={<Saloons />} />
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </MainContent>
    </Container>
  );
};

export default AdminDashboard; 