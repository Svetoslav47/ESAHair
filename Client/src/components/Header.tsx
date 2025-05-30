import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

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

const LogoText = styled.div`
  font-family: 'Montserrat', 'Arial', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #C19B76;
  letter-spacing: 2px;
  cursor: pointer;
  user-select: none;
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

const NavAnchor = styled.a`
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <HeaderContainer>
      <LogoText onClick={handleLogoClick}>МХ ЗАКИ</LogoText>
      <BurgerButton onClick={toggleMenu} aria-label="Toggle menu">
        <BurgerIcon $isOpen={isMenuOpen} />
      </BurgerButton>
      <Nav $isOpen={isMenuOpen}>
        <NavAnchor href="#services" onClick={e => handleScroll(e, 'services')}>УСЛУГИ</NavAnchor>
        <NavAnchor href="#book-now" onClick={e => handleScroll(e, 'book-now')}>РЕЗЕРВИРАЙ</NavAnchor>
        <NavAnchor href="#team" onClick={e => handleScroll(e, 'team')}>ЕКИП</NavAnchor>
        <NavAnchor href="#contacts" onClick={e => handleScroll(e, 'contacts')}>КОНТАКТИ</NavAnchor>
      </Nav>
    </HeaderContainer>
  );
};

export default Header;