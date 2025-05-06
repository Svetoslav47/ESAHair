import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { format, addDays, isToday, isTomorrow } from 'date-fns';
import { TimeSlot } from '../../../types/times';

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

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 2.5rem;
  font-weight: bold;
  margin-top: 0;
  letter-spacing: 2px;
`;

const DaysGrid = styled.div`
  display: flex;
  gap: 2rem;
  justify-content: center;
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1.5rem;
    align-items: center;
  }
`;

const DayColumn = styled.div`
  background: rgba(17,17,17,0.85);
  border-radius: 8px;
  padding: 1rem;
  min-width: 200px;
`;

const DayTitle = styled.h3`
  color: #C19B76;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const TimeSlotButton = styled.button<{ $isSelected: boolean }>`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid ${({ $isSelected }) => ($isSelected ? '#C19B76' : '#333')};
  background: ${({ $isSelected }) => ($isSelected ? '#C19B76' : '#222')};
  color: ${({ $isSelected }) => ($isSelected ? '#000' : '#fff')};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  &:hover {
    background: ${({ $isSelected }) => ($isSelected ? '#C19B76' : '#444')};
    border-color: #C19B76;
  }
`;

const NoTimeSlotsMessage = styled.div`
  color: #666;
  text-align: center;
  padding: 2rem;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
`;

interface TimeSlotSelectionProps {
  salonId: string;
  staffId: number;
  serviceId: string;
  onTimeSlotSelect: (slot: TimeSlot) => void;
  selectedTimeSlot?: TimeSlot;
}

// Mocked API: always uses server time (simulate with new Date())
const mockFetchTimeSlots = async (_salonId: string, _staffId: number, _serviceId: string) => {
  // Simulate server "now"
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = addDays(today, 1);
  // Example slots: 10:00, 12:00, 14:00, 16:00
  const slots = [10, 12, 14, 16].map(hour => ({
    start: new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour).toISOString(),
    end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour + 1).toISOString()
  }));
  const slotsTomorrow = [10, 12, 14, 16].map(hour => ({
    start: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hour).toISOString(),
    end: new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), hour + 1).toISOString()
  }));
  return {
    [format(today, 'yyyy-MM-dd')]: slots,
    [format(tomorrow, 'yyyy-MM-dd')]: slotsTomorrow
  };
};

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({ salonId, staffId, serviceId, onTimeSlotSelect, selectedTimeSlot }) => {
  const [timeSlots, setTimeSlots] = useState<{ [date: string]: TimeSlot[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    mockFetchTimeSlots(salonId, staffId, serviceId).then(setTimeSlots).finally(() => setLoading(false));
  }, [salonId, staffId, serviceId]);

  if (loading) {
    return <Container>Loading available time slots...</Container>;
  }

  const days = Object.keys(timeSlots);

  return (
    <Container>
      <StepWrapper>
        <Title>Select a Time Slot</Title>
        <DaysGrid>
          {days.map(dateStr => {
            const dateObj = new Date(dateStr);
            let label = format(dateObj, 'EEEE, MMM d');
            if (isToday(dateObj)) label = 'Today';
            else if (isTomorrow(dateObj)) label = 'Tomorrow';
            return (
              <DayColumn key={dateStr}>
                <DayTitle>{label}</DayTitle>
                {timeSlots[dateStr].length === 0 ? (
                  <NoTimeSlotsMessage>No available slots</NoTimeSlotsMessage>
                ) : (
                  timeSlots[dateStr].map(slot => (
                    <TimeSlotButton
                      key={slot.start}
                      $isSelected={selectedTimeSlot?.start === slot.start}
                      onClick={() => onTimeSlotSelect(slot)}
                    >
                      {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                    </TimeSlotButton>
                  ))
                )}
              </DayColumn>
            );
          })}
        </DaysGrid>
      </StepWrapper>
    </Container>
  );
};

export default TimeSlotSelection; 