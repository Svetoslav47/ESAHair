import styled from 'styled-components';

const HeroSection = styled.section`
  position: relative;
  height: 100vh;
  width: 90%;
  margin: 0 auto;
  background-color: #000;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 5%;
  flex-direction: row-reverse;

  @media (max-width: 768px) {
    padding: 0;
    text-align: center;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
`;

const HeroContent = styled.div`
  max-width: 600px;
  z-index: 2;

  @media (max-width: 768px) {
    max-width: 100%;
    padding: 0 20px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
`;

const HeroImage = styled.div`
  width: 50%;
  height: 80%;
  background-image: url('Zaki.jpg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  filter: grayscale(100%);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30%;
    background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 1));
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 20%,
      transparent 80%,
      rgba(0, 0, 0, 0.3) 100%
    ),
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.2) 0%,
      transparent 20%,
      transparent 80%,
      rgba(0, 0, 0, 0.2) 100%
    );
    pointer-events: none;
  }

  @media (max-width: 768px) {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    opacity: 0.3;
    background-size: cover;

    &::after {
      display: none;
    }
  }
`;

const Title = styled.h2`
  font-size: 4rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  
  @media (max-width: 768px) {
    font-size: 2.3rem;
    text-wrap: nowrap;
  }
`;

const Subtitle = styled.p`
  font-size: 1.25rem;
  margin-bottom: 2rem;
  max-width: 500px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
    margin: 0 auto 4rem;
  }
`;

const BookButton = styled.button`
  background-color: white;
  color: black;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #C19B76;
    color: white;
  }

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1.2rem;
    justify-content: center;
    align-items: center;
    height: 50px;
  }
`;

export default function Hero() {
  
    return (
      <HeroSection>
        <HeroContent>
          <Title>ДОБРЕ ДОШЛИ</Title>
          <Subtitle>
            Запазете час в бръснарница Мх Заки за перфектната прическа.
          </Subtitle>
          <BookButton onClick={() => {
            const bookingSection = document.getElementById('book-now');
            if (bookingSection) {
              bookingSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}>
            Резервирай
          </BookButton>
        </HeroContent>
        <HeroImage />
      </HeroSection>
    );
  }