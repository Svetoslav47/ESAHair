import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { fetchSaloons } from '../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
  max-width: 100vw;
  margin: 0 auto;
  background: transparent;
  border-radius: 0;
  border: none;
  color: #fff;
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: bold;
  margin-top: 0;
  letter-spacing: 2px;
`;

const SalonsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const SalonCard = styled.div<{ $isSelected?: boolean }>`
  background-color: rgba(17,17,17,0.85);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};
  box-shadow: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  &:hover {
    transform: translateY(-3px);
    border-color: #C19B76;
  }
`;

const SalonImage = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const SalonAddress = styled.p`
  color: #aaa;
  font-size: 1rem;
  margin: 0.5rem 0 0 0;
  text-align: center;
`;

const SalonName = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin: 0;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
`;

interface Salon {
  id: string;
  name: string;
  image: string;
  address: string;
}

interface SalonSelectionProps {
  selectedSalon?: string;
  onSelect: (salon: Salon) => void;
}

const SalonSelection: React.FC<SalonSelectionProps> = ({ selectedSalon, onSelect }) => {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaloons()
      .then(data => {
        setSalons(data);
        setLoading(false);
      })
      .catch(() => {
        setSalons([]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Container>Loading salons...</Container>;
  }

  return (
    <Container>
      <StepWrapper>
        <Title>Select Salon</Title>
        <SalonsGrid>
          {salons.map(salon => (
            <SalonCard
              key={salon.id}
              onClick={() => onSelect(salon)}
              $isSelected={selectedSalon === salon.id}
            >
              <SalonImage src={salon.image} alt={salon.name} />
              <SalonName>{salon.name}</SalonName>
              <SalonAddress>{salon.address}</SalonAddress>
            </SalonCard>
          ))}
        </SalonsGrid>
      </StepWrapper>
    </Container>
  );
};

export default SalonSelection; 