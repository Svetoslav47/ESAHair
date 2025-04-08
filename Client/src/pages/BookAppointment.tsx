import styled from 'styled-components';
import BookingSteps from '../components/booking/BookingSteps';
import StaffSelection from '../components/booking/steps/StaffSelection';
import ServiceSelection from '../components/booking/steps/ServiceSelection';
import { useState, useCallback, useEffect, useRef } from 'react';
import DateSelection from '../components/booking/steps/DateSelection';

const PageContainer = styled.div`
  background-color: #000;
  display: flex;
  flex-direction: column;
`;

const LocationText = styled.p`
  text-align: center;
  color: #C19B76;
  padding: 1rem;
  font-size: 1.2rem;
`;

const Title = styled.h1`
  color: #fff;
  text-align: center;
  font-size: 2.5rem;
  text-transform: uppercase;
  width: 100%;
`;

const StepContainer = styled.div<{ $isVisible: boolean }>`
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  transform: translateY(${({ $isVisible }) => ($isVisible ? '0' : '20px')});
  transition: opacity 0.3s ease, transform 0.3s ease;
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  pointer-events: ${({ $isVisible }) => ($isVisible ? 'auto' : 'none')};
`;

const ContentContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

interface BookingState {
  service?: { id: number; name: string; duration: string; price: string };
  staff?: { id: number; name: string };
  dateTime?: string;
  details?: {
    name: string;
    phone: string;
    email: string;
  };
}

const services = [
  { 
    id: 1, 
    name: 'Haircut & Beard Trim - Коса и Брада', 
    duration: '60 m', 
    price: '60.00 лв', 
    description: 'Arriving more than 15mins late to your appointment will result to an additional 10lv fee!' 
  },
  { 
    id: 2, 
    name: 'Haircut - Подстригване', 
    duration: '60 m', 
    price: '45.00 лв', 
    description: 'Arriving more than 15mins late to your appointment will result to an additional 10lv fee!' 
  },
  { 
    id: 3, 
    name: 'Buzz Cut - Машинка', 
    duration: '30 m', 
    price: '40.00 лв', 
    description: 'Arriving more than 10mins late to your appointment will result to an additional 10lv fee!' 
  },
  { 
    id: 4, 
    name: 'Beard Trim - Оформяне на Брада', 
    duration: '30 m', 
    price: '30.00 лв', 
    description: 'Arriving more than 10mins late to your appointment will result to an additional 10lv fee!' 
  }
];

const BookAppointment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingState, setBookingState] = useState<BookingState>({});

  const isUserNavigation = useRef(true);

  const canNavigateToStep = useCallback((step: number) => {
    switch (step) {
      case 0: // Service selection
        return true;
      case 1: // Staff selection
        return !!bookingState.service;
      case 2: // Date & Time
        return !!bookingState.service && !!bookingState.staff;
      case 3: // Details
        return !!bookingState.service && !!bookingState.staff && !!bookingState.dateTime;
      case 4: // Summary
        return !!bookingState.service && !!bookingState.staff && !!bookingState.dateTime && !!bookingState.details;
      default:
        return false;
    }
  }, [bookingState]);

  const handleStepChange = (step: number) => {
    if (canNavigateToStep(step)) {
      setCurrentStep(step);
    }
  };

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && typeof event.state.step === 'number') {
        isUserNavigation.current = false;
        setCurrentStep(event.state.step);
      }
    };
  
    window.addEventListener('popstate', handlePopState);
  
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  useEffect(() => {
    if (isUserNavigation.current) {
      window.history.pushState({ step: currentStep }, '');
    }
    isUserNavigation.current = true;
  }, [currentStep]);

  const handleServiceSelect = (service: any) => {
    setBookingState(prev => ({
      ...prev,
      service: {
        id: service.id,
        name: service.name,
        duration: service.duration,
        price: service.price
      }
    }));
    setTimeout(() => setCurrentStep(1), 100);
  };

  const handleStaffSelect = (staffId: number, staffName: string) => {
    setBookingState(prev => ({
      ...prev,
      staff: {
        id: staffId,
        name: staffName
      }
    }));
    setTimeout(() => setCurrentStep(2), 100);
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setBookingState(prev => ({
      ...prev,
      dateTime: `${date.toISOString().split('T')[0]} ${time}`
    }));
  };
  return (
    <PageContainer>
      <Title>Book an Appointment</Title>
      <LocationText>ul. "Cherkovna" 20, Poduyane, Sofia</LocationText>
      <BookingSteps 
        currentStep={currentStep} 
        setCurrentStep={handleStepChange}
        canNavigateToStep={canNavigateToStep}
        selectedBarber={bookingState.staff?.name || null}
        onDateTimeSelect={handleDateTimeSelect}
      />
      <ContentContainer>
        <StepContainer $isVisible={currentStep === 0}>
          <ServiceSelection 
            services={services} 
            selectedService={bookingState.service?.id}
            onSelect={handleServiceSelect}
          />
        </StepContainer>
        <StepContainer $isVisible={currentStep === 1}>
          <StaffSelection 
            selectedStaff={bookingState.staff?.id ?? -1}
            onSelect={handleStaffSelect}
          />
        </StepContainer>
        <StepContainer $isVisible={currentStep === 2}>
          <DateSelection
              barberName={bookingState.staff?.name ?? ""}
              onDateTimeSelect={() => {}}
          />
          </StepContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default BookAppointment;

