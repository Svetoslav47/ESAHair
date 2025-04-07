import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-sizing: border-box;
  margin-bottom: 2rem;
  padding: 0 2rem;

  @media (max-width: 768px) {
    grid-template-columns: minmax(0, 1fr);
  }
`;

const ServiceCard = styled.div<{ $isSelected?: boolean }>`
  background-color: #111;
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};

  &:hover {
    transform: translateY(-5px);
    border-color: #C19B76;
  }
`;

const ServiceHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem;
`;

const ServiceImage = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
`;

const ServiceName = styled.h3`
  font-size: 1.2rem;
  color: #fff;
  flex: 1;
`;

const ServiceDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const Duration = styled.span`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #C19B76;
  font-size: 0.9rem;
`;

const Price = styled.span`
  color: #C19B76;
  font-weight: bold;
  font-size: 1.1rem;
`;

const Description = styled.p`
  color: #999;
  font-size: 0.9rem;
  margin: 0.5rem 0;
`;

interface Service {
  id: number;
  name: string;
  duration: string;
  price: string;
  description: string;
}

interface SelectServiceProps {
  services: Service[];
  onSelect: (service: Service) => void;
  selectedService?: number;
}

const ServiceSelection: React.FC<SelectServiceProps> = ({ services, onSelect, selectedService }) => {
  return (
    <Container>
      <Title>Select Service</Title>
      <ServicesGrid>
        {services.map(service => (
          <ServiceCard 
            key={service.id} 
            onClick={() => onSelect(service)}
            $isSelected={selectedService === service.id}
          >
            <ServiceHeader>
              <ServiceImage src="/images/service-placeholder.jpg" alt={service.name} />
              <ServiceName>{service.name}</ServiceName>
            </ServiceHeader>
            <ServiceDetails>
              <Description>{service.description}</Description>
              <ServiceInfo>
                <Duration>
                  <FontAwesomeIcon icon={faClock} />
                  {service.duration}
                </Duration>
                <Price>{service.price}</Price>
              </ServiceInfo>
            </ServiceDetails>
          </ServiceCard>
        ))}
      </ServicesGrid>
    </Container>
  );
};

export default ServiceSelection;
