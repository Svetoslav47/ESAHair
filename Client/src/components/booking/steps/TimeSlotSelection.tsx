import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { format, addDays, addHours } from 'date-fns';
import { TimeSlot } from '../../../types/times';
import { fetchTimeSlots } from '../../../services/api';

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

const OtherSalonMessage = styled.div`
  color: #C19B76;
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
`;

const PeopleSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
`;

const PeopleLabel = styled.span`
  color: #fff;
  font-size: 1rem;
`;

const PeopleButton = styled.button`
  background: #222;
  border: 1px solid #C19B76;
  color: #fff;
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #C19B76;
    color: #000;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PeopleCount = styled.span`
  color: #fff;
  font-size: 1.2rem;
  min-width: 2rem;
  text-align: center;
`;

interface TimeSlotSelectionProps {
  salonId: string;
  staffId: string;
  serviceId: string;
  onTimeSlotSelect: (time: TimeSlot, numberOfPeople: number) => void;
  selectedTimeSlot: TimeSlot | null;
  selectedNumberOfPeople?: number;
}

const formatTimeFromISO = (isoString: string) => {
  const time = isoString.split('T')[1].substring(0, 5);
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
};

const TimeSlotSelection: React.FC<TimeSlotSelectionProps> = ({ 
  salonId, 
  staffId, 
  serviceId, 
  onTimeSlotSelect, 
  selectedTimeSlot,
  selectedNumberOfPeople = 1 
}) => {
  const [timeSlots, setTimeSlots] = useState<{ [date: string]: TimeSlot[] }>({});
  const [loading, setLoading] = useState(true);
  const [numberOfPeople, setNumberOfPeople] = useState(selectedNumberOfPeople);
  const [otherSalonInfo, setOtherSalonInfo] = useState<{ [date: string]: { message: string; salonName: string } }>({});

  const handlePeopleChange = (change: number) => {
    const newCount = numberOfPeople + change;
    if (newCount >= 1 && newCount <= 3) {
      setNumberOfPeople(newCount);
    }
  };

  useEffect(() => {
    if (!salonId || !staffId || !serviceId) return;
    setLoading(true);
    setOtherSalonInfo({});
    const today = new Date()
    console.log("the date today is:", today)
    const tomorrow = new Date()
    const todayStr = format(today, 'yyyy-MM-dd');
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    // Fetch slots for each day independently
    const fetchSlotsForDay = async (date: string) => {
      try {
        const response = await fetchTimeSlots(staffId, salonId, serviceId, date, numberOfPeople);
        if (response.isAssignedToOtherSalon && response.message && response.otherSalonName) {
          setOtherSalonInfo(prev => ({
            ...prev,
            [date]: {
              message: response.message,
              salonName: response.otherSalonName
            }
          }));
          return [];
        }
        return response;
      } catch (error) {
        console.error(`Error fetching slots for ${date}:`, error);
        return [];
      }
    };

    // Fetch both days in parallel
    Promise.all([
      fetchSlotsForDay(todayStr),
      fetchSlotsForDay(tomorrowStr)
    ]).then(([todaySlots, tomorrowSlots]) => {
      setTimeSlots({
        [todayStr]: todaySlots,
        [tomorrowStr]: tomorrowSlots
      });
    }).finally(() => {
      setLoading(false);
    });
  }, [salonId, staffId, serviceId, numberOfPeople]);

  if (loading && Object.keys(timeSlots).length === 0) {
    return <Container>Зареждане на свободни часове...</Container>;
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');

  return (
    <Container>
      <StepWrapper>
        <Title>Изберете час</Title>
        <PeopleSelector>
          <PeopleLabel>Брой хора:</PeopleLabel>
          <PeopleButton 
            onClick={() => handlePeopleChange(-1)}
            disabled={numberOfPeople <= 1}
          >
            -
          </PeopleButton>
          <PeopleCount>{numberOfPeople}</PeopleCount>
          <PeopleButton 
            onClick={() => handlePeopleChange(1)}
            disabled={numberOfPeople >= 3}
          >
            +
          </PeopleButton>
        </PeopleSelector>
        <DaysGrid>
          <DayColumn>
            <DayTitle>Днес ({today})</DayTitle>
            <TimeSlotsContainer>
              {loading ? (
                <NoTimeSlotsMessage>зарежда</NoTimeSlotsMessage>
              ) : otherSalonInfo[today] ? (
                <OtherSalonMessage>
                  {otherSalonInfo[today].message}
                </OtherSalonMessage>
              ) : timeSlots[today]?.length > 0 ? (
                timeSlots[today].map((slot) => (
                  <TimeSlotButton
                    key={slot.start}
                    $isSelected={selectedTimeSlot?.start === slot.start}
                    onClick={() => onTimeSlotSelect(slot, numberOfPeople)}
                  >
                    {formatTimeFromISO(slot.start)}
                  </TimeSlotButton>
                ))
              ) : (
                <NoTimeSlotsMessage>Няма свободни часове</NoTimeSlotsMessage>
              )}
            </TimeSlotsContainer>
          </DayColumn>
          <DayColumn>
            <DayTitle>Утре ({tomorrow})</DayTitle>
            <TimeSlotsContainer>
              {loading ? (
                <NoTimeSlotsMessage>зарежда</NoTimeSlotsMessage>
              ) : otherSalonInfo[tomorrow] ? (
                <OtherSalonMessage>
                  {otherSalonInfo[tomorrow].message}
                </OtherSalonMessage>
              ) : timeSlots[tomorrow]?.length > 0 ? (
                timeSlots[tomorrow].map((slot) => (
                  <TimeSlotButton
                    key={slot.start}
                    $isSelected={selectedTimeSlot?.start === slot.start}
                    onClick={() => onTimeSlotSelect(slot, numberOfPeople)}
                  >
                    {formatTimeFromISO(slot.start)}
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