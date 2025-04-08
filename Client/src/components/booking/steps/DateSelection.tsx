import styled from 'styled-components';
import { useState } from 'react';
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

const Container = styled.div`
  display: flex;
  flex-direction: row;
  gap: 2rem;
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  background-color: #000;
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Title = styled.h2`
  color: #C19B76;
  text-align: center;
  margin-bottom: 1rem;
`;

const CalendarContainer = styled.div`
  background: #000;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  background: #000;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-height: 400px;
  overflow-y: auto;
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

interface TimeSlot {
  time: string;
}

const BARBER_AVAILABILITY: Record<string, Record<string, TimeSlot[]>> = {
  'Lucky': {
    '2025-03-31': [
      { time: '10:00 - 11:00'},
      { time: '10:15 - 11:15'},
      { time: '10:30 - 11:30'},
      { time: '10:45 - 11:45'},
      { time: '11:00 - 12:00'},
      { time: '11:15 - 12:15'},
      { time: '11:30 - 12:30'},
      { time: '11:45 - 12:45'},
      { time: '12:00 - 13:00'},
      { time: '12:15 - 13:15'},
      { time: '12:30 - 13:30'},
      { time: '12:45 - 13:45'},
      { time: '13:00 - 14:00'},
      { time: '13:15 - 14:15'},
      { time: '13:30 - 14:30'},
      { time: '13:45 - 14:45'},
      { time: '14:00 - 15:00'},
      { time: '14:15 - 15:15'},
      { time: '14:30 - 15:30'},
      { time: '14:45 - 15:45'},
      { time: '15:00 - 16:00'},
      { time: '15:15 - 16:15'},
      { time: '15:30 - 16:30'},
      { time: '15:45 - 16:45'},
      { time: '16:00 - 17:00'},
      { time: '16:15 - 17:15'},
      { time: '16:30 - 17:30'},
      { time: '16:45 - 17:45'},
      { time: '17:00 - 18:00'},
      { time: '17:15 - 18:15'},
      { time: '17:30 - 18:30'},
      { time: '17:45 - 18:45'},
      { time: '18:00 - 19:00'},
      
    ],
    '2025-04-07': [
      { time: '10:00 - 11:00'},
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
    ],
    '2025-04-08': [
      { time: '10:00 - 11:00'},
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
    ],
    '2025-04-09': [
      { time: '10:00 - 11:00'},
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
    ],
    '2025-04-10': [
      { time: '10:00 - 11:00'},
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
    ],
    '2025-04-14': [
      { time: '10:00 - 11:00'},
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
    ]
  }
};

interface DateSelectionProps {
  barberName: string;
  onDateTimeSelect: (date: Date, time: string) => void;
}

const DateSelection = ({ barberName, onDateTimeSelect }: DateSelectionProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleDateSelect = (date: Date) => {
    console.log('Date selected:', date);
    setSelectedDate(date);
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    if (selectedDate) {
      onDateTimeSelect(selectedDate, time);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return BARBER_AVAILABILITY[barberName]?.[dateStr] || [];
  };

  const availableTimeSlots = getAvailableTimeSlots();

  return (
    <>
      <Title>Date & Time</Title>
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
              const isAvailable = !!BARBER_AVAILABILITY[barberName]?.[dateStr];
              return (
                <DayCell
                  key={day.toISOString()}
                  $isCurrentMonth={isSameMonth(day, currentMonth)}
                  $isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                  $isAvailable={isAvailable}
                  onClick={() => handleDateSelect(day)}
                >
                  {format(day, 'd')}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarContainer>

        <TimeSlotsContainer>
          {selectedDate ? (
            availableTimeSlots.length > 0 ? (
              <>
                {availableTimeSlots.map(slot => (
                  <TimeSlotButton
                    key={slot.time}
                    $isSelected={selectedTime === slot.time}
                    onClick={() => handleTimeSelect(slot.time)}
                  >
                    {slot.time}
                  </TimeSlotButton>
                ))}
              </>
            ) : (
              <NoTimeSlotsMessage>
                No available time slots for this date. Please select another date.
              </NoTimeSlotsMessage>
            )
          ) : (
            <NoTimeSlotsMessage>
              Please select a date to view available time slots.
            </NoTimeSlotsMessage>
          )}
        </TimeSlotsContainer>
      </Container>
    </>
  );
};

export default DateSelection; 