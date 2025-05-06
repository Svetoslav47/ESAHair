import styled from 'styled-components';
import { useEffect } from 'react';
import { useState } from 'react';
import { Barber } from '../../../types/barber.ts';
import { fetchBarbers } from '../../../services/api';

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

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
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

const StaffRole = styled.p`
  color: #C19B76;
  text-align: center;
  font-size: 0.9rem;
  text-transform: capitalize;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
`;

interface StaffSelectionProps {
  selectedStaff: number;
  onSelect: (id: number, name: string) => void;
}

const StaffSelection = ({ selectedStaff, onSelect }: StaffSelectionProps) => {
  const [staff, setStaff] = useState<Barber[]>([]);

  useEffect(() => {
    fetchBarbers().then(setStaff);
  }, []);

  return (
    <Container>
      <StepWrapper>
        <Title>Choose Your Barber</Title>
        <StaffGrid>
          {staff.map((member) => (
            <StaffCard 
              key={member.id}
              $isSelected={selectedStaff === member.id}
              onClick={() => onSelect(member.id, member.name)}
            >
              <StaffImage src={member.image} alt={member.name} />
              <StaffName>{member.name}</StaffName>
              <StaffRole>{member.role}</StaffRole>
            </StaffCard>
          ))}
        </StaffGrid>
      </StepWrapper>
    </Container>
  );
};

export default StaffSelection; 