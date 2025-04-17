import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { 
  format,
  addMonths,
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isSameMonth, 
  startOfWeek, 
  endOfWeek
} from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TimeSlot } from '../../../types/times';
import { BarberAvailability } from '../../../types/barberAvailability';
import { fetchBarberAvailability } from '../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
  padding: 1.5rem 2rem;
  max-width: 850px;
  margin: 2rem auto;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
  color: #fff;

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 1rem 1.5rem;
  }
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.6rem;
  font-weight: 600;
`;

const LoadingTitle = styled.div`
  color: #C19B76;
  text-align: center;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const CalendarContainer = styled.div`
  background: #111;
  border-radius: 8px;
  padding: 1rem;
  flex: 1;
  min-width: 300px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MonthTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 500;
  color: #fff;
  margin: 0;
`;

const NavigationButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #fff;
  
  &:hover {
    color: #C19B76;
  }
`;

const WeekDaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  margin-bottom: 0.5rem;
`;

const WeekDay = styled.div`
  font-weight: 500;
  padding: 0.5rem;
  color: #fff;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
`;

const DayCell = styled.button<{ $isCurrentMonth: boolean; $isSelected: boolean; $isAvailable: boolean }>`
  aspect-ratio: 1;
  background: ${({ $isSelected, $isAvailable, $isCurrentMonth }) => 
    $isSelected ? '#C19B76' : $isAvailable ? ($isCurrentMonth ? '#333' : '#1a1a1a') : '#111'};
  color: ${({ $isCurrentMonth, $isSelected }) => 
    !$isCurrentMonth ? '#555' : $isSelected ? '#000' : '#fff'};
  cursor: ${({ $isAvailable }) => ($isAvailable ? 'pointer' : 'default')};
  font-size: 1rem;
  padding: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    border-color: #C19B76;
  }
`;

const TimeSlotsContainer = styled.div`
  background: #111;
  border-radius: 8px;
  padding: 1rem;
  max-height: 400px;
  overflow-y: auto;
  flex: 1;
  min-width: 200px;
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


interface DateSelectionProps {
  barberName: string;
  onDateTimeSelect: (time: TimeSlot) => void;
  serviceId: string;
}

const DateSelection = ({ barberName, onDateTimeSelect, serviceId }: DateSelectionProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const [barberAvailability, setBarberAvailability] = useState<BarberAvailability | null>(null);

  useEffect(() => {
    if (barberName && serviceId) {
      setBarberAvailability(null);
      setIsLoading(true);
      fetchBarberAvailability(barberName, serviceId).then(setBarberAvailability).finally(() => setIsLoading(false));
    }
  }, [barberName, serviceId]);

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: TimeSlot) => {
    setSelectedTime(time);
    if (selectedDate) {
      handleDateTimeSelect(time);
    }
  };

  const handleDateTimeSelect = (time: TimeSlot) => {
    onDateTimeSelect(time);
    // Auto-redirect to the next step after a short delay
    setTimeout(() => {
      // The next step is index 3 (PersonalInfo)
      window.dispatchEvent(new CustomEvent('stepChange', { detail: 3 }));
    }, 100);
  };

  const getAvailableTimeSlots = (): TimeSlot[] => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return barberAvailability?.[dateStr] || [];
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <>
      <Title>Date & Time</Title>
      {isLoading && <LoadingTitle>Loading available time slots...</LoadingTitle>}
      <Container>
        <CalendarContainer>
          <CalendarHeader>
            <NavigationButton onClick={handlePrevMonth}>
              <FontAwesomeIcon icon={faChevronLeft} />
            </NavigationButton>
            <MonthTitle>
              {format(currentMonth, 'MMMM yyyy')}
            </MonthTitle>
            <NavigationButton onClick={handleNextMonth}>
              <FontAwesomeIcon icon={faChevronRight} />
            </NavigationButton>
          </CalendarHeader>

          <WeekDaysGrid>
            {weekDays.map(day => (
              <WeekDay key={day}>{day}</WeekDay>
            ))}
          </WeekDaysGrid>

          <DaysGrid>
            {monthDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isAvailable = !!barberAvailability?.[dateStr] && barberAvailability?.[dateStr].length > 0;
              return (
                <DayCell
                  key={day.toISOString()}
                  $isCurrentMonth={isSameMonth(day, currentMonth)}
                  $isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                  $isAvailable={isAvailable}
                  onClick={() => handleDateSelect(day)}
                  disabled={isLoading}
                >
                  {format(day, 'd')}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarContainer>

        <TimeSlotsContainer>
          {!selectedDate ? (
            <NoTimeSlotsMessage>
              Please select a date to view available time slots.
            </NoTimeSlotsMessage>
          ) : availableTimeSlots.length > 0 ? (
            <>
              {availableTimeSlots.map((slot: TimeSlot) => (
                <TimeSlotButton
                  key={slot.start}
                  $isSelected={selectedTime === slot}
                  onClick={() => handleTimeSelect(slot)}
                >
                  {format(new Date(slot.start), 'HH:mm')} - {format(new Date(slot.end), 'HH:mm')}
                </TimeSlotButton>
              ))}
            </>
          ) : (
            <NoTimeSlotsMessage>
              No available time slots for this date. Please select another date.
            </NoTimeSlotsMessage>
          )}
        </TimeSlotsContainer>
      </Container>
    </>
  );
};

export default DateSelection; 