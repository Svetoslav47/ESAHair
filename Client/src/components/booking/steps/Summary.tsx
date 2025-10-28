import styled from 'styled-components';
import { format } from 'date-fns';
import { TimeSlot } from '../../../types/times';
import { BookingState } from '../../../types/bookingState';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookAppointment } from '../../../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  max-width: 100vw;
  margin: 0 auto;
  background: transparent;
  border-radius: 0;
  border: none;
  color: #fff;
`;

// const IllustrationPlaceholder = styled.div`
//   text-align: center;
//   margin-bottom: 1.5rem;
//   &:before {
//     content: '[Illustration Here]';
//     display: inline-block;
//     padding: 2rem;
//     color: #666;
//     font-style: italic;
//     border: 1px dashed #444;
//     border-radius: 4px;
//   }
// `;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 0.25rem;
  font-size: 2.5rem;
  font-weight: bold;
  margin-top: 0;
  letter-spacing: 2px;
`;

const DisclaimerText = styled.p`
  color: #aaa;
  text-align: center;
  font-size: 0.85rem;
  max-width: 550px;
  margin: 0 auto 1.5rem auto;
  line-height: 1.3;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0 1rem;
`;

const CustomerInfo = styled.div`
  text-align: center;
`;

const DetailLabel = styled.span`
  display: block;
  color: #aaa;
  font-size: 0.75rem;
  margin-bottom: 0.15rem;
  text-transform: uppercase;
`;

const CustomerName = styled.p`
  font-size: 1rem;
  font-weight: 500;
  color: #fff;
`;

const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1.5rem;
`;

const DetailColumn = styled.div`
  text-align: left;
`;

const DetailValue = styled.p`
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
`;

const HorizontalLine = styled.hr`
  border: none;
  border-top: 1px solid #333;
  margin: 0.5rem 0;
`;

const TotalAmountContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const TotalLabel = styled.span`
  font-size: 0.95rem;
  font-weight: 500;
  color: #fff;
`;

const TotalPrice = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
`;

const TotalPrimaryPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #C19B76;
  line-height: 1;
  display: inline-block;
`;

const TotalSecondaryPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 500;
  color: #999;
  opacity: 0.7;
  line-height: 1;
  display: inline-block;
`;

const FinishButton = styled.button`
  padding: 0.9rem;
  background-color: #C19B76;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background-color: #D4B08C;
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingContent = styled.div`
  background: #1a1a1a;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  color: #fff;
`;

const LoadingText = styled.p`
  color: #C19B76;
  font-size: 1.2rem;
  margin: 1rem 0;
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
`;

interface SummaryProps {
  bookingState: BookingState;
}

const Summary = ({ bookingState }: SummaryProps) => {
  const { service, staff, dateTime, details, numberOfPeople = 1 } = bookingState;
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const formatDateAndTime = (dateTimeString: TimeSlot | undefined): string => {
    if (!dateTimeString) return 'Not selected';
    try {
      const startDateTimePart = dateTimeString.start;
      const endDateTimePart = dateTimeString.end;
      const date = startDateTimePart.split('T')[0];
      const startTime = startDateTimePart.split('T')[1].substring(0, 5);
      const endTime = endDateTimePart.split('T')[1].substring(0, 5);
      return `${date} ${startTime}`;
    } catch (e) {
      console.error("Error parsing date:", dateTimeString, e);
      return 'Invalid date/time';
    }
  };

  const handleFinishBooking = async () => {
    setIsLoading(true);
    try {
      const appointment = {
        barberName: staff?.name || '',
        customerEmail: '',
        customerPhone: details?.phone || '',
        customerName: details?.firstname || '',
        date: dateTime?.start || '',
        serviceId: service?._id || '',
        numberOfPeople
      };
      const data = await bookAppointment(appointment);
      
      if ('error' in data) {
        throw new Error(data.error);
      }
      navigate('/thank-you', {
        state: {
          booking: {
            customerName: details?.firstname || '',
            serviceName: service?.name,
            barberName: staff?.name,
            date: dateTime?.start,
            priceEUR: service?.priceEUR ?? ((service?.price ?? 0) / 1.95583),
            priceBGN: service?.priceBGN ?? service?.price ?? 0,
            bookingId: data.bookingId,
            numberOfPeople
          }
        }
      });
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <StepWrapper>
        <Title>Потвърждение</Title>
        <MainContent>
          <CustomerInfo>
            <DetailLabel>Клиент</DetailLabel>
            <CustomerName>{details?.firstname}</CustomerName>
          </CustomerInfo>

          <DetailsGrid>
            <DetailColumn>
              <DetailLabel>Услуга</DetailLabel>
              <DetailValue>{service?.name}</DetailValue>
            </DetailColumn>
            <DetailColumn>
              <DetailLabel>Фризьор</DetailLabel>
              <DetailValue>{staff?.name}</DetailValue>
            </DetailColumn>
            <DetailColumn>
              <DetailLabel>Дата и час</DetailLabel>
              <DetailValue>{formatDateAndTime(dateTime)}</DetailValue>
            </DetailColumn>
            <DetailColumn>
              <DetailLabel>Брой хора</DetailLabel>
              <DetailValue>{numberOfPeople}</DetailValue>
            </DetailColumn>
          </DetailsGrid>

          <HorizontalLine />

          <TotalAmountContainer>
            <TotalLabel>Обща сума</TotalLabel>
            <TotalPrice>
              <TotalPrimaryPrice>{((service?.priceBGN ?? service?.price ?? 0) * numberOfPeople).toFixed(2)} лв.</TotalPrimaryPrice>
              <TotalSecondaryPrice>{((service?.priceEUR ?? ((service?.price ?? 0) / 1.95583)) * numberOfPeople).toFixed(2)} EUR</TotalSecondaryPrice>
            </TotalPrice>
          </TotalAmountContainer>

          <FinishButton onClick={handleFinishBooking} disabled={isLoading}>
            {isLoading ? 'Зареждане...' : 'Завърши резервацията'}
          </FinishButton>
        </MainContent>
      </StepWrapper>
      {isLoading && (
        <LoadingOverlay>
          <LoadingContent>
            <LoadingText>Обработка на резервацията...</LoadingText>
          </LoadingContent>
        </LoadingOverlay>
      )}
    </Container>
  );
};

export default Summary; 