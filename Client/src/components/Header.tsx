import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #000000;
  position: relative;
  z-index: 1000;
  width: 100%;
`;

const Logo = styled.img`
  height: 40px;
  cursor: pointer;
`;

const Nav = styled.nav<{ $isOpen: boolean }>`
  display: flex;
  gap: 2rem;
  box-sizing: border-box;

  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background-color: #000000;
    padding: 1rem;
    gap: 1rem;
    align-items: center;
    border-top: 1px solid #222;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
`;

const NavLink = styled(Link)`
  color: #FFFFFF;
  text-decoration: none;
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 500;
  transition: color 0.3s ease;

  &:hover {
    color: #888888;
  }
`;

const LanguageButton = styled.button`
  color: #FFFFFF;
  text-decoration: none;
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 500;
  transition: color 0.3s ease;
  background: none;
  border: 1px solid #FFFFFF;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  cursor: pointer;

  &:hover {
    color: #888888;
  }
`;

const BurgerButton = styled.button`
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  width: 30px;
  height: 30px;
  position: relative;
  outline: none;

  &:focus {
    outline: none;
  }

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const BurgerIcon = styled.div<{ $isOpen: boolean }>`
  width: 20px;
  height: 2px;
  background-color: ${({ $isOpen }) => ($isOpen ? 'transparent' : 'white')};
  position: relative;
  transition: all 0.3s ease;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    width: 20px;
    height: 2px;
    background-color: white;
    transition: all 0.3s ease;
  }

  &::before {
    top: ${({ $isOpen }) => ($isOpen ? '0' : '-6px')};
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(45deg)' : 'rotate(0)')};
  }

  &::after {
    bottom: ${({ $isOpen }) => ($isOpen ? '0' : '-6px')};
    transform: ${({ $isOpen }) => ($isOpen ? 'rotate(-45deg)' : 'rotate(0)')};
  }
`;

const Header = () => {
  const [language, setLanguage] = useState('EN');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'EN' ? 'BG' : 'EN');
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  return (
    <HeaderContainer>
      <Logo src={logo} alt="Finest Barber Studio" />
      <BurgerButton onClick={toggleMenu} aria-label="Toggle menu">
        <BurgerIcon $isOpen={isMenuOpen} />
      </BurgerButton>
      <Nav $isOpen={isMenuOpen}>
        <NavLink to="#services" onClick={() => setIsMenuOpen(false)}>УСЛУГИ</NavLink>
        <NavLink to="/book-appointment" onClick={() => setIsMenuOpen(false)}>РЕЗЕРВИРАЙ</NavLink>
        <NavLink to="#team" onClick={() => setIsMenuOpen(false)}>ЕКИП</NavLink>
        <NavLink to="#contacts" onClick={() => setIsMenuOpen(false)}>КОНТАКТИ</NavLink>
        <LanguageButton onClick={toggleLanguage}>
          {language}
        </LanguageButton>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;