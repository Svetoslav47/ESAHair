import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faStore, faScissors, faUser, faClock, faClipboard, faCheck } from '@fortawesome/free-solid-svg-icons';
import ServiceSelection from './booking/steps/ServiceSelection';
import StaffSelection from './booking/steps/StaffSelection';
import PersonalInfo from './booking/steps/PersonalInfo';
import Summary from './booking/steps/Summary';
import { TimeSlot } from '../types/times';
import { Service } from '../types/service';
import { BookingState } from '../types/bookingState';
import SalonSelection from './booking/steps/SalonSelection';
import TimeSlotSelection from './booking/steps/TimeSlotSelection';

const BookingContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 100vw;
  margin: 0 auto;
  background: rgba(0,0,0,0.7);
  border-radius: 6px;
  border: none;
  box-shadow: none;
  overflow: visible;
  overflow-x: hidden;
  height: auto;
  min-height: 0;
  box-sizing: border-box;
`;

const BookingHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem 1.5rem;
  background: transparent;
  border-bottom: none;
  box-sizing: border-box;
  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
  }
`;

const Title = styled.h2`
  color: #fff;
  margin: 0;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: bold;
  letter-spacing: 2px;
  text-align: center;
  @media (max-width: 480px) {
    font-size: 1.5rem;
    letter-spacing: 1px;
  }
`;

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.5rem 0.5rem;
  background: transparent;
  border-bottom: none;
  flex-wrap: wrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }
  width: 100%;
  box-sizing: border-box;
  overflow-x: auto;
  @media (max-width: 480px) {
    gap: 0.5rem;
    padding: 0.5rem 0.25rem;
    justify-content: flex-start;
    flex-wrap: nowrap;
  }
`;

const Step = styled.div<{ $isActive?: boolean; $isPast?: boolean; $isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#C19B76' : $isPast ? 'rgba(193, 155, 118, 0.7)' : '#fff'};
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  font-size: clamp(0.875rem, 2vw, 1rem);
  font-weight: 500;
  transition: color 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
  padding: 0 0.5rem;
  @media (max-width: 480px) {
    font-size: 0.75rem;
    padding: 0 0.25rem;
    gap: 0.125rem;
  }
`;

const StepIcon = styled.div<{ $isActive?: boolean; $isPast?: boolean; $isDisabled?: boolean }>`
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? 'transparent' : $isActive ? '#C19B76' : $isPast ? 'transparent' : 'transparent'};
  border: 2px solid ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#C19B76' : $isPast ? 'rgba(193, 155, 118, 0.6)' : '#fff'};
  color: ${({ $isActive, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#000' : '#fff'};
  transition: all 0.3s ease;
  flex-shrink: 0;
  @media (max-width: 480px) {
    width: 1.5rem;
    height: 1.5rem;
    border-width: 1.5px;
  }
`;

const StepContent = styled.div`
  padding: 1rem 0;
  height: auto;
  min-height: 0;
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
  @media (max-width: 480px) {
    padding: 0.75rem 0;
  }
`;

const NavigationButton = styled.button<{ $direction: 'prev' | 'next' }>`
  position: absolute;
  top: 50%;
  ${({ $direction }) => $direction === 'prev' ? 'left: 0.5rem;' : 'right: 0.5rem;'}
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.3);
  border: none;
  color: #fff;
  width: 36px;
  height: 36px;
  min-width: 44px;
  min-height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 2;
  box-sizing: border-box;
  &:hover {
    background: #C19B76;
    color: #fff;
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
  @media (max-width: 480px) {
    width: 44px;
    height: 44px;
    ${({ $direction }) => $direction === 'prev' ? 'left: 0.25rem;' : 'right: 0.25rem;'}
  }
`;

const EmbeddedBooking: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingState, setBookingState] = useState<BookingState>({});
  const isNavigatingFromHistory = useRef(false);
  const isInitialMount = useRef(true);

  const steps = [
    { icon: faStore, text: 'Избери салон' },
    { icon: faScissors, text: 'Услуга' },
    { icon: faUser, text: 'Избери фризьор' },
    { icon: faClock, text: 'Дата и час' },
    { icon: faClipboard, text: 'Детайли' }
  ];

  const canNavigateToStep = (step: number) => {
    switch (step) {
      case 0: return true;
      case 1: return !!bookingState.salon;
      case 2: return !!bookingState.salon && !!bookingState.service;
      case 3: return !!bookingState.salon && !!bookingState.service && !!bookingState.staff;
      case 4: return !!bookingState.salon && !!bookingState.service && !!bookingState.staff && !!bookingState.dateTime;
      default: return false;
    }
  };

  const handleSalonSelect = (salon: { id: string; name: string }) => {
    setBookingState(prev => ({
      ...prev,
      salon,
      service: undefined,
      staff: undefined,
      dateTime: undefined,
      details: undefined
    }));
    setCurrentStep(1);
  };

  const handleServiceSelect = (service: Service) => {
    setBookingState(prev => ({
      ...prev,
      service
    }));
    setCurrentStep(2);
  };

  const handleStaffSelect = (staffId: string, staffName: string) => {
    setBookingState(prev => ({
      ...prev,
      staff: { id: staffId, name: staffName }
    }));
    setCurrentStep(3);
  };

  const handleDateTimeSelect = (time: TimeSlot, numberOfPeople: number) => {
    setBookingState(prev => ({
      ...prev,
      dateTime: time,
      numberOfPeople
    }));
    setCurrentStep(4);
  };

  const handleDetailsSubmit = (details: { 
    firstname: string; 
    phone: string;
    termsAccepted: boolean;
  }) => {
    setBookingState(prev => ({
      ...prev,
      details: {
        firstname: details.firstname,
        phone: details.phone,
        termsAccepted: details.termsAccepted
      }
    }));
  };

  const handleStepClick = (index: number) => {
    if (canNavigateToStep(index)) {
      setCurrentStep(index);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleNext = () => {
    if (canNavigateToStep(currentStep + 1)) setCurrentStep(currentStep + 1);
  };

  // Initialize history state on mount
  useEffect(() => {
    // Replace current history entry with initial step state
    window.history.replaceState({ step: 0 }, '', window.location.href);
    isInitialMount.current = false;
  }, []);

  // Handle browser back/forward button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const step = event.state?.step ?? 0;
      // Allow navigation back to any previous step, or forward if navigation is allowed
      if (step !== currentStep) {
        const isGoingBack = step < currentStep;
        if (isGoingBack || canNavigateToStep(step)) {
          isNavigatingFromHistory.current = true;
          setCurrentStep(step);
          // Reset flag after state update
          setTimeout(() => {
            isNavigatingFromHistory.current = false;
          }, 0);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [currentStep]);

  // Push history state when step changes (forward navigation)
  useEffect(() => {
    // Skip on initial mount or when navigating from browser history
    if (isInitialMount.current || isNavigatingFromHistory.current) {
      return;
    }

    // Push new history entry for forward navigation
    window.history.pushState({ step: currentStep }, '', window.location.href);
  }, [currentStep]);

  console.log(bookingState);
  return (
    <BookingContainer id="book-now">
      <BookingHeader>
        <Title>Запази си час</Title>
      </BookingHeader>
      
      <StepsContainer>
        {steps.map((step, index) => (
          <Step
            key={index}
            $isActive={currentStep === index}
            $isPast={currentStep > index}
            $isDisabled={!canNavigateToStep(index)}
            onClick={() => handleStepClick(index)}
          >
            <StepIcon
              $isActive={currentStep === index}
              $isPast={currentStep > index}
              $isDisabled={!canNavigateToStep(index)}
            >
              <FontAwesomeIcon icon={step.icon} />
            </StepIcon>
            <span>{step.text}</span>
          </Step>
        ))}
      </StepsContainer>

      <StepContent>
        {currentStep === 0 && (
          <SalonSelection
            selectedSalon={bookingState.salon?.id}
            onSelect={handleSalonSelect}
          />
        )}
        {currentStep === 1 && (
          <ServiceSelection
            selectedService={bookingState.service?._id}
            onSelect={handleServiceSelect}
          />
        )}
        {currentStep === 2 && (
          <StaffSelection
            selectedStaff={bookingState.staff?.id ?? ''}
            onSelect={handleStaffSelect}
            saloonId={bookingState.salon?.id ?? ''}
            date={new Date().toISOString().split('T')[0]}
          />
        )}
        {currentStep === 3 && (
          <TimeSlotSelection
            salonId={bookingState.salon?.id ?? ''}
            staffId={bookingState.staff?.id ?? ''}
            serviceId={bookingState.service?._id ?? ''}
            onTimeSlotSelect={handleDateTimeSelect}
            selectedTimeSlot={bookingState.dateTime}
          />
        )}
        {currentStep === 4 && (
          <PersonalInfo
            onDetailsSubmit={handleDetailsSubmit}
            bookingState={bookingState}
          />
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, position: 'relative', minHeight: '44px' }}>
          {currentStep > 0 && (
            <NavigationButton $direction="prev" onClick={handlePrev}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </NavigationButton>
          )}
          {currentStep < steps.length - 1 && canNavigateToStep(currentStep + 1) && (
            <NavigationButton $direction="next" onClick={handleNext}>
              <FontAwesomeIcon icon={faChevronRight} />
            </NavigationButton>
          )}
        </div>
      </StepContent>
    </BookingContainer>
  );
};

export default EmbeddedBooking; 