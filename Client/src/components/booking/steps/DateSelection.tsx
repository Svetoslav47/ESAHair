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
  endOfWeek, 
  parse,
  getHours
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
`;

const TimeSlotSection = styled.div`
  margin-bottom: 1rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h4`
  color: #C19B76;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
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
      { time: '12:00 - 13:00'},
      { time: '13:00 - 14:00'},
      { time: '18:00 - 19:00'}
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

  const getSlotStartHour = (slot: TimeSlot) => {
    const startTime = slot.time.split(' - ')[0];
    const parsed = parse(startTime, 'HH:mm', new Date());
    return getHours(parsed);
  };

  const availableTimeSlots = getAvailableTimeSlots();
  const morningSlots = availableTimeSlots.filter(slot => {
    const hour = getSlotStartHour(slot);
    return hour < 12;
  });
  
  const afternoonSlots = availableTimeSlots.filter(slot => {
    const hour = getSlotStartHour(slot);
    return hour >= 12 && hour < 17;
  });
  
  const eveningSlots = availableTimeSlots.filter(slot => {
    const hour = getSlotStartHour(slot);
    return hour >= 17;
  });

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
                {morningSlots.length > 0 && (
                  <TimeSlotSection>
                    <SectionTitle>Morning</SectionTitle>
                    {morningSlots.map(slot => (
                      <TimeSlotButton
                        key={slot.time}
                        $isSelected={selectedTime === slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                      >
                        {slot.time}
                      </TimeSlotButton>
                    ))}
                  </TimeSlotSection>
                )}

                {afternoonSlots.length > 0 && (
                  <TimeSlotSection>
                    <SectionTitle>Afternoon</SectionTitle>
                    {afternoonSlots.map(slot => (
                      <TimeSlotButton
                        key={slot.time}
                        $isSelected={selectedTime === slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                      >
                        {slot.time}
                      </TimeSlotButton>
                    ))}
                  </TimeSlotSection>
                )}

                {eveningSlots.length > 0 && (
                  <TimeSlotSection>
                    <SectionTitle>Evening</SectionTitle>
                    {eveningSlots.map(slot => (
                      <TimeSlotButton
                        key={slot.time}
                        $isSelected={selectedTime === slot.time}
                        onClick={() => handleTimeSelect(slot.time)}
                      >
                        {slot.time}
                      </TimeSlotButton>
                    ))}
                  </TimeSlotSection>
                )}
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