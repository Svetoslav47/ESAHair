import styled from 'styled-components';
import BookingSteps from '../components/booking/BookingSteps';
import StaffSelection from '../components/booking/steps/StaffSelection';
import ServiceSelection from '../components/booking/steps/ServiceSelection';
import { useState, useCallback, useEffect, useRef } from 'react';
import DateSelection from '../components/booking/steps/DateSelection';
import PersonalInfo from '../components/booking/steps/PersonalInfo';
import Summary from '../components/booking/steps/Summary';
import { TimeSlot } from '../types/times';
import { Service } from '../types/service';
import { BookingState } from '../types/bookingState';
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
  display: ${({ $isVisible }) => ($isVisible ? 'block' : 'none')};
  width: 100%;
  padding: 0 1rem;
  box-sizing: border-box;
  position: absolute;
  left: 0;
  right: 0;
`;

const ContentContainer = styled.div`
  position: relative;
  flex: 1;
`;

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

    const handleStepChange = (event: CustomEvent) => {
      if (typeof event.detail === 'number') {
        setCurrentStep(event.detail);
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('stepChange', handleStepChange as EventListener);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('stepChange', handleStepChange as EventListener);
    };
  }, []);

  useEffect(() => {
    if (isUserNavigation.current) {
      window.history.pushState({ step: currentStep }, '');
    }
    isUserNavigation.current = true;
  }, [currentStep]);

  const handleServiceSelect = (service: Service ) => {
    setBookingState(prev => ({
      ...prev,
      service: service
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

  const handleDateTimeSelect = (time: TimeSlot) => {
    setBookingState(prev => ({
      ...prev,
      dateTime: time
    }));
  };

  const handleDetailsSubmit = (details: { 
    firstname: string; 
    lastname: string; 
    email: string; 
    phone: string;
    termsAccepted: boolean;
  }) => {
    setBookingState(prev => ({
      ...prev,
      details
    }));
    setTimeout(() => setCurrentStep(4), 100);
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
            selectedService={bookingState.service?._id}
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
            onDateTimeSelect={handleDateTimeSelect}
            serviceId={bookingState.service?._id ?? ""}
          />
        </StepContainer>
        <StepContainer $isVisible={currentStep === 3}>
          <PersonalInfo
            onDetailsSubmit={handleDetailsSubmit}
          />
        </StepContainer>
        <StepContainer $isVisible={currentStep === 4}>
          <Summary bookingState={bookingState} />
        </StepContainer>
      </ContentContainer>
    </PageContainer>
  );
};

export default BookAppointment;

