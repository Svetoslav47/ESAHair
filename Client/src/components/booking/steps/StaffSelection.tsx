import styled from 'styled-components';
import { useEffect } from 'react';
import { useState } from 'react';
import { Barber } from '../../../types/barber.ts';
import { fetchBarbers } from '../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 1000px;
  margin: 2rem auto;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
  color: #fff;
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: 600;
  margin-top: 0;
`;

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const StaffCard = styled.div<{ $isSelected?: boolean }>`
  background-color: #111;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};
  aspect-ratio: 3/4;
  display: flex;
  flex-direction: column;


  &:hover {
    transform: translateY(-5px);
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
    </Container>
  );
};

export default StaffSelection; 