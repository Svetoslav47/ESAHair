import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../types/service';
import { fetchServices } from '../../../services/api';

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

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  width: 100%;
`;

const ServiceCard = styled.div<{ $isSelected?: boolean }>`
  background-color: rgba(17,17,17,0.85);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};
  box-shadow: none;
  &:hover {
    transform: translateY(-3px);
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
  text-align: center;
  justify-content: center;
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
  flex: 1;
`;

interface SelectServiceProps {
  onSelect: (service: Service) => void;
  selectedService?: string;
}

const ServiceSelection: React.FC<SelectServiceProps> = ({ onSelect, selectedService }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const fetchedServices = await fetchServices();
        setServices(fetchedServices);
      } catch (err) {
        setError('Failed to load services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  if (loading) {
    return <Container>Зареждане на услуги...</Container>;
  }

  if (error) {
    return <Container>{error}</Container>;
  }

  return (
    <Container>
      <StepWrapper>
        <Title>Избери Услуга</Title>
        <ServicesGrid>
          {services.map(service => (
            <ServiceCard 
              key={service._id} 
              onClick={() => onSelect(service)}
              $isSelected={selectedService === service._id}
            >
              <ServiceHeader>
                <ServiceImage src={service.image || "/images/service-placeholder.jpg"} alt={service.name} />
                <ServiceName>{service.name}</ServiceName>
              </ServiceHeader>
              <ServiceDetails>
                <Description>{service.description}</Description>
                <ServiceInfo>
                  <Duration>
                    <FontAwesomeIcon icon={faClock} />
                    {service.duration} минути
                  </Duration>
                  <Price>{service.price} лв.</Price>
                </ServiceInfo>
              </ServiceDetails>
            </ServiceCard>
          ))}
        </ServicesGrid>
      </StepWrapper>
    </Container>
  );
};

export default ServiceSelection;
