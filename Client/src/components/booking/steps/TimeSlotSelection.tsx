import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { format, parseISO, isToday, isTomorrow, addDays } from 'date-fns';
import { bg } from 'date-fns/locale';
import { TimeSlot } from '../../../types/times';
import { fetchTimeSlots } from '../../../services/api';
import { toZonedTime } from 'date-fns-tz';

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
  max-height: 400px;
  display: flex;
  flex-direction: column;
`;

const DayTitle = styled.h3`
  color: #C19B76;
  font-size: 1.1rem;
  margin-bottom: 1rem;
  text-align: center;
  flex-shrink: 0;
`;

const TimeSlotsContainer = styled.div`
  overflow-y: auto;
  flex: 1;
  padding-right: 0.5rem;
  
  /* Scrollbar styling */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #C19B76;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a88a6a;
  }
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: clamp(0.875rem, 2vw, 1rem);
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

const ErrorMessage = styled.div`
  color: #ff6b6b;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.9rem;
  background: rgba(255, 107, 107, 0.1);
  border-radius: 4px;
  margin-bottom: 0.5rem;
`;

interface TimeSlotSelectionProps {
  salonId: string;
  staffId: string;
  serviceId: string;
  onTimeSlotSelect: (time: TimeSlot) => void;
  selectedTimeSlot: TimeSlot | null;
}

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({ salonId, staffId, serviceId, onTimeSlotSelect, selectedTimeSlot }) => {
  const [timeSlots, setTimeSlots] = useState<{ [date: string]: TimeSlot[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!salonId || !staffId || !serviceId) return;
    setLoading(true);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    // Fetch slots for each day independently
    const fetchSlotsForDay = async (date: string) => {
      try {
        const slots = await fetchTimeSlots(staffId, salonId, serviceId, date);
        for (const slot of slots) {
          const clientTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          slot.start = toZonedTime(slot.start, clientTimezone);
          slot.end = toZonedTime(slot.end, clientTimezone);
        }
        setTimeSlots(prev => ({
          ...prev,
          [date]: slots
        }));
      } catch (error) {
        console.error(`Error fetching slots for ${date}:`, error);
        // Set empty array for failed fetches instead of showing error
        setTimeSlots(prev => ({
          ...prev,
          [date]: []
        }));
      }
    };

    // Fetch both days in parallel
    Promise.all([
      fetchSlotsForDay(todayStr),
      fetchSlotsForDay(tomorrowStr)
    ]).finally(() => {
      setLoading(false);
      console.log('All time slots:', timeSlots);
    });
  }, [salonId, staffId, serviceId]);

  if (loading && Object.keys(timeSlots).length === 0) {
    return <Container>Loading available time slots...</Container>;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <Container>
      <StepWrapper>
        <Title>Изберете час</Title>
        <DaysGrid>
          <DayColumn>
            <DayTitle>Днес</DayTitle>
            <TimeSlotsContainer>
              {timeSlots[today]?.length > 0 ? (
                timeSlots[today].map((slot) => (
                  <TimeSlotButton
                    key={slot.start}
                    $isSelected={selectedTimeSlot?.start === slot.start}
                    onClick={() => onTimeSlotSelect(slot)}
                  >
                    {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                  </TimeSlotButton>
                ))
              ) : (
                <NoTimeSlotsMessage>Няма свободни часове</NoTimeSlotsMessage>
              )}
            </TimeSlotsContainer>
          </DayColumn>
          <DayColumn>
            <DayTitle>Утре</DayTitle>
            <TimeSlotsContainer>
              {timeSlots[tomorrow]?.length > 0 ? (
                timeSlots[tomorrow].map((slot) => (
                  <TimeSlotButton
                    key={slot.start}
                    $isSelected={selectedTimeSlot?.start === slot.start}
                    onClick={() => onTimeSlotSelect(slot)}
                  >
                    {format(slot.start, 'h:mm a')} - {format(slot.end, 'h:mm a')}
                  </TimeSlotButton>
                ))
              ) : (
                <NoTimeSlotsMessage>Няма свободни часове</NoTimeSlotsMessage>
              )}
            </TimeSlotsContainer>
          </DayColumn>
        </DaysGrid>
      </StepWrapper>
    </Container>
  );
};

export default TimeSlotSelection; 