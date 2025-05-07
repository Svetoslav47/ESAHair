import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Barber } from '../types/barber';
import { fetchBarbers } from '../services/api';

const Container = styled.div`
  max-width: 1100px;
  margin: 3rem auto 2rem auto;
  padding: 0 1rem;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
`;

const StaffGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 2rem;
  justify-items: center;
`;

const StaffCard = styled.div`
  background: rgba(17,17,17,0.85);
  border-radius: 10px;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
  width: 100%;
  max-width: 220px;
`;

const StaffImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
`;

const StaffName = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  text-align: center;
`;

const StaffShowcase: React.FC = () => {
  const [staff, setStaff] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBarbers().then(data => {
      setStaff(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <Container id="team">
      <Title>Бръснари</Title>
      <StaffGrid>
        {staff.map(member => (
          <StaffCard key={member.id}>
            <StaffImage src={member.image} alt={member.name} />
            <StaffName>{member.name}</StaffName>
          </StaffCard>
        ))}
      </StaffGrid>
    </Container>
  );
};

export default StaffShowcase; 