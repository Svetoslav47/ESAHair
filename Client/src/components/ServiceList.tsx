import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Service } from '../types/service';
import { fetchServices } from '../services/api';
import { getServicePriceBGN, getServicePriceEUR, formatPriceBGN, formatPriceEUR } from '../utils/servicePrice';

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

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const ServiceCard = styled.div`
  background: rgba(17,17,17,0.85);
  border-radius: 10px;
  padding: 2rem 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 16px rgba(0,0,0,0.10);
`;

const ServiceImage = styled.img`
  width: 90px;
  height: 90px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1.2rem;
`;

const ServiceName = styled.h3`
  color: #fff;
  font-size: 1.3rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: center;
`;

const ServiceDescription = styled.p`
  color: #ccc;
  font-size: 1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const ServiceInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  margin-top: 0.5rem;
`;

const Duration = styled.span`
  color: #C19B76;
  font-size: 1rem;
`;

const Price = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
`;

const PrimaryPrice = styled.span`
  color: #C19B76;
  font-size: 1rem;
  font-weight: bold;
  line-height: 1;
  display: inline-block;
`;

const SecondaryPrice = styled.span`
  color: #999;
  font-size: 1rem;
  opacity: 0.7;
  line-height: 1;
  display: inline-block;
`;

const ServiceList: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServices().then(data => {
      setServices(data);
      setLoading(false);
    });
  }, []);

  if (loading) return null;

  return (
    <Container id="services">
      <Title>Услуги</Title>
      <ServicesGrid>
        {services.map(service => (
          <ServiceCard key={service._id}>
            <ServiceImage src={service.image || '/images/service-placeholder.jpg'} alt={service.name} />
            <ServiceName>{service.name}</ServiceName>
            <ServiceDescription>{service.description}</ServiceDescription>
            <ServiceInfo>
              <Duration>{service.duration} мин.</Duration>
              <Price>
                <PrimaryPrice>{formatPriceBGN(getServicePriceBGN(service))} лв.</PrimaryPrice>
                <SecondaryPrice>{formatPriceEUR(getServicePriceEUR(service))} EUR</SecondaryPrice>
              </Price>
            </ServiceInfo>
          </ServiceCard>
        ))}
      </ServicesGrid>
    </Container>
  );
};

export default ServiceList; 