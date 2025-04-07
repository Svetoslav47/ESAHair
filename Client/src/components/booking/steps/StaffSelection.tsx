import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #000;
  color: #fff;
  width: 100%;
  padding: 0;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  margin: 2rem 0;
  text-align: center;
  color: #fff;
`;

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
    padding: 0 2rem;
  }
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
  flex: 1;
  object-fit: cover;
  border-radius: 4px;
  margin-bottom: 1rem;
`;

const StaffName = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const StaffRole = styled.p`
  color: #C19B76;
  text-align: center;
  font-size: 0.9rem;
`;

interface StaffMember {
  id: number;
  name: string;
  role: string;
  image: string;
}

interface StaffSelectionProps {
  selectedStaff?: number;
  onSelect?: (id: number) => void;
}

const StaffSelection = ({ selectedStaff, onSelect }: StaffSelectionProps) => {
  const staff: StaffMember[] = [
    {
      id: 1,
      name: 'Lucky',
      role: 'Head Barber',
      image: '/path/to/lucky.jpg'
    },
    {
      id: 2,
      name: 'Ivan',
      role: 'Barber',
      image: '/path/to/ivan.jpg'
    },
    {
      id: 3,
      name: 'Gaby',
      role: 'Hair Braider',
      image: '/path/to/gaby.jpg'
    }
  ];

  return (
    <Container>
      <Title>Choose Your Barber</Title>
      <StaffGrid>
        {staff.map((member) => (
          <StaffCard 
            key={member.id}
            $isSelected={selectedStaff === member.id}
            onClick={() => onSelect?.(member.id)}
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