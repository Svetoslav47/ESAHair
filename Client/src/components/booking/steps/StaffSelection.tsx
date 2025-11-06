import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { Barber } from '../../../types/barber.ts';
import { fetchBarbersAssignedToSaloon } from '../../../services/api';

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
  box-sizing: border-box;
  width: 100%;
  overflow-x: hidden;
  @media (max-width: 480px) {
    padding: 0.5rem 0;
    gap: 1rem;
  }
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: bold;
  margin-top: 0;
  letter-spacing: 2px;
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    letter-spacing: 1px;
  }
`;

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
  }
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }
`;

const StaffCard = styled.div<{ $isSelected?: boolean }>`
  background-color: rgba(17,17,17,0.85);
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;
  box-shadow: none;
  box-sizing: border-box;
  width: 100%;
  @media (max-width: 480px) {
    padding: 0.75rem;
  }
  &:hover {
    transform: translateY(-3px);
    border-color: #C19B76;
  }
`;

const StaffImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const StaffName = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
  text-align: center;
  text-transform: capitalize;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding: 1rem 1rem;
    margin: 1rem auto;
  }
  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
    margin: 0.5rem auto;
    max-width: 100vw;
  }
`;

interface StaffSelectionProps {
  selectedStaff: string;
  onSelect: (id: string, name: string) => void;
  saloonId: string;
  date: string; // ISO date string (yyyy-MM-dd)
}

const StaffSelection = ({ selectedStaff, onSelect, saloonId, date }: StaffSelectionProps) => {
  const [staff, setStaff] = useState<Barber[]>([]);

  useEffect(() => {
    if (saloonId && date) {
      fetchBarbersAssignedToSaloon(saloonId, date)
        .then((data) => {
          setStaff(data);
        })
        .catch(() => {
          setStaff([]);
        });
    } else {
      setStaff([]);
    }
  }, [saloonId, date]);

  return (
    <Container>
      <StepWrapper>
        <Title>Избери Фризьор</Title>
        <StaffGrid>
          {staff.map((member) => (
            <StaffCard 
              key={member.id}
              $isSelected={selectedStaff === member.id}
              onClick={() => onSelect(member.id, member.name)}
            >
              <StaffImage src={member.image} alt={member.name} />
              <StaffName>{member.name}</StaffName>
            </StaffCard>
          ))}
        </StaffGrid>
      </StepWrapper>
    </Container>
  );
};

export default StaffSelection; 