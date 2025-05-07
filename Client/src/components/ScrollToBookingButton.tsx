import React from 'react';
import styled from 'styled-components';

const ScrollButton = styled.button`
  background-color: white;
  color: black;
  border: none;
  font-size: 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 1rem 2.5rem;
  border-radius: 4px;
  margin: 1.5rem auto 0 auto;
  display: block;

  &:hover {
    background-color: #C19B76;
    color: white;
  }

  @media (max-width: 768px) {
    padding: 0;
    width: 90%;
    font-size: 1.2rem;
    justify-content: center;
    align-items: center;
    height: 50px;
  }
`;

const ScrollToBookingButton: React.FC = () => {
  const handleClick = () => {
    const el = document.getElementById('book-now');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <ScrollButton onClick={handleClick}>
      Резервирай
    </ScrollButton>
  );
};

export default ScrollToBookingButton; 