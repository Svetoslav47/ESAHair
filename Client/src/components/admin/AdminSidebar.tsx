import React from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCalendarAlt, 
  faCut, 
  faUserTie, 
  faStore,
  faBars,
  faTimes,
  IconDefinition
} from '@fortawesome/free-solid-svg-icons';

const Overlay = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'block' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.2);
  z-index: 1500;
`;

const SidebarContainer = styled.div<{ isOpen: boolean }>`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: 250px;
  background-color: #2a2a2a;
  transition: transform 0.3s ease;
  z-index: 2000;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transform: ${({ isOpen }) => isOpen ? 'translateX(0)' : 'translateX(-100%)'};
`;

const BurgerButton = styled.button`
  position: fixed;
  top: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: #C19B76;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  font-size: 1.3rem;

  &:hover {
    background-color: #b08a65;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  right: 15px;
  top: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #C19B76;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #b08a65;
  }
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  margin-top: 60px;
`;

const NavItem = styled.li<{ isActive: boolean }>`
  padding: 15px 20px;
  display: flex;
  align-items: center;
  color: ${props => props.isActive ? '#C19B76' : '#fff'};
  background-color: ${props => props.isActive ? 'rgba(193, 155, 118, 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(193, 155, 118, 0.1);
    color: #C19B76;
  }
`;

const Icon = styled(FontAwesomeIcon)<{ isActive: boolean }>`
  width: 20px;
  margin-right: 15px;
  color: ${props => props.isActive ? '#C19B76' : '#fff'};
  transition: color 0.2s;
`;

const Label = styled.span`
  opacity: 1;
  transition: opacity 0.2s ease;
  white-space: nowrap;
`;

interface NavItem {
  path: string;
  icon: IconDefinition;
  label: string;
}

const navItems: NavItem[] = [
  { path: '/admin/dashboard/calendar', icon: faCalendarAlt, label: 'Календар' },
  { path: '/admin/dashboard/services', icon: faCut, label: 'Услуги' },
  { path: '/admin/dashboard/barbers', icon: faUserTie, label: 'Фризьори' },
  { path: '/admin/dashboard/saloons', icon: faStore, label: 'Салони' }
];

interface AdminSidebarProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Burger icon always visible in top left */}
      {!isOpen && (
        <BurgerButton onClick={openSidebar} aria-label="Open sidebar">
          <FontAwesomeIcon icon={faBars} />
        </BurgerButton>
      )}
      {/* Overlay and sidebar only when open */}
      <Overlay isOpen={isOpen} onClick={closeSidebar} />
      <SidebarContainer isOpen={isOpen}>
        {isOpen && (
          <>
            <CloseButton onClick={closeSidebar} aria-label="Close sidebar">
              <FontAwesomeIcon icon={faTimes} />
            </CloseButton>
            <NavList>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavItem
                    key={item.path}
                    isActive={isActive}
                    onClick={() => {
                      navigate(item.path);
                      closeSidebar();
                    }}
                  >
                    <Icon icon={item.icon} isActive={isActive} />
                    <Label>{item.label}</Label>
                  </NavItem>
                );
              })}
            </NavList>
          </>
        )}
      </SidebarContainer>
    </>
  );
};

export default AdminSidebar; 