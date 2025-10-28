import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';
import Tooltip from '../common/Tooltip';
import { 
  faScissors, 
  faUser, 
  faCalendarAlt, 
  faClipboardList, 
  faCheck 
} from '@fortawesome/free-solid-svg-icons';
import { TimeSlot } from '../../types/times';

const StepsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  background-color: #000;
  padding: 2rem;

  @media (max-width: 768px) {
    gap: 0.8rem;
    flex-direction: row;
    align-items: center;
    position: relative;
    padding: 1rem;
    max-width: 300px;
    margin: 0 auto;

    &::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 2rem;
      right: 2rem;
      height: 2px;
      background-color: #fff;
      z-index: 0;
    }
  }
`;

const Step = styled.div<{ $isActive?: boolean; $isPast?: boolean; $isDisabled?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#C19B76' : $isPast ? 'rgba(193, 155, 118, 0.7)' : '#fff'};
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  transition: color 0.3s ease;
  white-space: nowrap;

  @media (max-width: 768px) {
    flex: 1;
    gap: 0;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  &:hover {
    color: ${({ $isDisabled }) => ($isDisabled ? '#666' : '#C19B76')};
  }
`;

const StepIcon = styled.div<{ $isActive?: boolean; $isPast?: boolean; $isDisabled?: boolean }>`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? '#333' : $isActive ? '#C19B76' : $isPast ? '#000' : '#000'};
  border: 2px solid ${({ $isActive, $isPast, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#C19B76' : $isPast ? 'rgba(193, 155, 118, 0.6)' : '#fff'};
  color: ${({ $isActive, $isDisabled }) => 
    $isDisabled ? '#666' : $isActive ? '#000' : '#fff'};
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
`;

const StepText = styled.span`
  font-size: 1rem;
  text-transform: uppercase;
  font-weight: 500;

  @media (max-width: 768px) {
    display: none;
  }
`;

interface BookingStepsProps {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  canNavigateToStep: (step: number) => boolean;
  selectedBarber: string | null;
  onDateTimeSelect: (time: TimeSlot) => void;
}

const BookingSteps = ({ 
  currentStep, 
  setCurrentStep, 
  canNavigateToStep,
}: BookingStepsProps) => {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const steps = [
    { icon: faScissors, text: 'Service', tooltip: 'Select a service to continue' },
    { icon: faUser, text: 'Barber/Hair Braider', tooltip: 'Select a service first' },
    { icon: faCalendarAlt, text: 'Date & Time', tooltip: 'Select a barber first' },
    { icon: faClipboardList, text: 'Basic Details', tooltip: 'Select date and time first' }
  ];

  const handleStepClick = (index: number) => {
    if (canNavigateToStep(index)) {
      setCurrentStep(index);
    }
  };


  return (
    <>
      <StepsContainer>
        {steps.map((step, index) => {
          const isDisabled = !canNavigateToStep(index);
          
          return (
            <Tooltip
              key={index}
              content={step.tooltip}
              show={isDisabled && hoveredStep === index}
            >
              <Step 
                $isActive={currentStep === index}
                $isPast={currentStep > index}
                $isDisabled={isDisabled}
                onClick={() => handleStepClick(index)}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <StepIcon 
                  $isActive={currentStep === index}
                  $isPast={currentStep > index}
                  $isDisabled={isDisabled}
                >
                  <FontAwesomeIcon icon={step.icon} />
                </StepIcon>
                <StepText>{step.text}</StepText>
              </Step>
            </Tooltip>
          );
        })}
      </StepsContainer>
    </>
  );
};

export default BookingSteps; 