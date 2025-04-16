import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../../types/service';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 1200px;
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
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
