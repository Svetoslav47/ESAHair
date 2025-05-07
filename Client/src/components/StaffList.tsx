import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Barber } from '../types/barber';
import { fetchBarbers } from '../services/api';

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto 1.5rem auto;
  padding: 0 1rem;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.2rem;
  text-align: center;
`;

const StaffScroll = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
`;

const StaffCard = styled.div`
  background: rgba(17,17,17,0.85);
  border-radius: 10px;
  min-width: 180px;
  max-width: 200px;
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
`;

const StaffImage = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.7rem;
`;

const StaffName = styled.h3`
  color: #fff;
  font-size: 1.1rem;
  margin: 0.2rem 0 0.1rem 0;
  text-align: center;
`;

const StaffRole = styled.p`
  color: #C19B76;
  font-size: 0.95rem;
  margin: 0;
  text-align: center;
`;

const StaffList: React.FC = () => {
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
    <Container>
      <Title>Екипът ни</Title>
      <StaffScroll>
        {staff.map(member => (
          <StaffCard key={member.id}>
            <StaffImage src={member.image} alt={member.name} />
            <StaffName>{member.name}</StaffName>
            <StaffRole>{member.role}</StaffRole>
          </StaffCard>
        ))}
      </StaffScroll>
    </Container>
  );
};

export default StaffList; 