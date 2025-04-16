import styled from 'styled-components';
import { format } from 'date-fns';
import { TimeSlot } from '../../../../types/times';
import { BookingState } from '../../../../types/bookingState';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1.5rem 2rem;
  max-width: 850px;
  margin: 2rem auto;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
  color: #fff;
`;

const TopBanner = styled.div`
  background-color: rgba(255, 100, 100, 0.1);
  color: #ff8a8a;
  padding: 0.7rem 1.5rem;
  border-radius: 4px;
  text-align: center;
  font-weight: 500;
  font-size: 0.9rem;
  margin-bottom: 1rem;
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
  font-size: 1.6rem;
  font-weight: 600;
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

const TotalPrice = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: #C19B76;
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



interface SummaryProps {
  bookingState: BookingState;
}

const Summary = ({ bookingState }: SummaryProps) => {
  const { service, staff, dateTime, details } = bookingState;

  const formatDateAndTime = (dateTimeString: TimeSlot | undefined): string => {
    if (!dateTimeString) return 'Not selected';
    try {
      const startDateTimePart = dateTimeString.start;
      const endDateTimePart = dateTimeString.end;

      console.log(dateTimeString);
      
      return format(startDateTimePart, 'MMMM d, yyyy, HH:mm') + ' - ' + format(endDateTimePart, 'HH:mm');
      
    } catch (e) {
      console.error("Error parsing date:", dateTimeString, e);
      return 'Invalid date/time';
    }
  };

  const handleFinishBooking = () => {
    fetch(`http://localhost:3000/book-appointment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        barberName: staff?.name,
        customerEmail: details?.email,
        customerPhone: details?.phone,
        customerName: details?.firstname + ' ' + details?.lastname,
        date: dateTime?.start,
        serviceId: service?._id
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Booking successful:', data);
    })
    .catch(error => {
      console.error('Error booking appointment:', error);
    });
  };

  return (
    <Container>
      <TopBanner>FINISH YOUR APPOINTMENT BY CLICKING THE BUTTON BELOW.</TopBanner>
      
      {/* <IllustrationPlaceholder /> */}

      <Title>Summary</Title>

      <DisclaimerText>
        Missing your appointment without letting us know in advance will result in a no show fee - 50% of the price of the service you've booked. To cancel or reschedule call or message the official instagram page.
      </DisclaimerText>

      <MainContent>
        {details && (
          <CustomerInfo>
            <DetailLabel>Customer</DetailLabel>
            <CustomerName>{details.firstname} {details.lastname}</CustomerName>
          </CustomerInfo>
        )}

        <DetailsGrid>
          <DetailColumn>
            <DetailLabel>Service</DetailLabel>
            <DetailValue>{service?.name || 'Not selected'}</DetailValue>
          </DetailColumn>
          <DetailColumn>
            <DetailLabel>Barber</DetailLabel>
            <DetailValue>{staff?.name || 'Not selected'}</DetailValue>
          </DetailColumn>
          <DetailColumn>
            <DetailLabel>Date & Time</DetailLabel>
            <DetailValue>{formatDateAndTime(dateTime)}</DetailValue>
          </DetailColumn>
        </DetailsGrid>

        <HorizontalLine />

        <TotalAmountContainer>
          <TotalLabel>Total Amount Due</TotalLabel>
          <TotalPrice>{service?.price || '0.00'} лв.</TotalPrice>
        </TotalAmountContainer>
      </MainContent>

      <FinishButton onClick={handleFinishBooking}>
        Finish Booking
      </FinishButton>
    </Container>
  );
};

export default Summary; 