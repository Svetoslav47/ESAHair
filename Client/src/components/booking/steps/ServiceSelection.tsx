import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';
import { Service } from '../../../types/service';
import { fetchServices } from '../../../services/api';
import { getServicePriceBGN, getServicePriceEUR, formatPriceBGN, formatPriceEUR } from '../../../utils/servicePrice';

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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const ServiceCard = styled.div<{ $isSelected?: boolean }>`
  background-color: rgba(17,17,17,0.85);
  border-radius: 8px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : 'transparent')};
  box-shadow: none;
  box-sizing: border-box;
  width: 100%;
  @media (max-width: 480px) {
    padding: 1rem;
  }
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

const Price = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

const PrimaryPrice = styled.span`
  color: #C19B76;
  font-size: 0.95rem;
  font-weight: bold;
  line-height: 1;
  display: inline-block;
`;

const SecondaryPrice = styled.span`
  color: #999;
  font-size: 0.95rem;
  opacity: 0.7;
  line-height: 1;
  display: inline-block;
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
                  <Price>
                    <PrimaryPrice>{formatPriceEUR(getServicePriceEUR(service))} EUR</PrimaryPrice>
                    <SecondaryPrice>/ {formatPriceBGN(getServicePriceBGN(service))} лв.</SecondaryPrice>
                  </Price>
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
