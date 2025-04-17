import styled from 'styled-components';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  max-width: 850px;
  margin: 2rem auto;
  background-color: #1a1a1a;
  border-radius: 8px;
  border: 1px solid #333;
  color: #fff;
  text-align: center;
`;

const SuccessIcon = styled.div`
  color: #4CAF50;
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  color: #fff;
  font-size: 2rem;
  font-weight: 600;
  margin: 0;
`;

const Subtitle = styled.p`
  color: #C19B76;
  font-size: 1.2rem;
  margin: 0;
`;

const BookingDetails = styled.div`
  background-color: #111;
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  margin: 1rem 0;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 1rem 0;
  padding-bottom: 1rem;
  border-bottom: 1px solid #333;
  
  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.span`
  color: #888;
`;

const DetailValue = styled.span`
  color: #fff;
  font-weight: 500;
`;

const Message = styled.p`
  color: #aaa;
  font-size: 0.9rem;
  max-width: 600px;
  line-height: 1.5;
`;

const ReturnButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.5rem;
  background-color: #C19B76;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin-top: 1rem;

  &:hover {
    background-color: #b08a65;
  }
`;

interface BookingConfirmation {
  customerName: string;
  serviceName: string;
  barberName: string;
  date: string;
  price: string;
  bookingId: string;
}

const ThankYou = ({ booking }: { booking: BookingConfirmation }) => {
  const navigate = useNavigate();

  return (
    <Container>
      <SuccessIcon>
        <FontAwesomeIcon icon={faCheckCircle} />
      </SuccessIcon>
      
      <div>
        <Title>Thank You!</Title>
        <Subtitle>Your appointment has been confirmed</Subtitle>
      </div>

      <BookingDetails>
        <DetailRow>
          <DetailLabel>Booking Reference</DetailLabel>
          <DetailValue>{booking.bookingId}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Customer Name</DetailLabel>
          <DetailValue>{booking.customerName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Service</DetailLabel>
          <DetailValue>{booking.serviceName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Barber</DetailLabel>
          <DetailValue>{booking.barberName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Date & Time</DetailLabel>
          <DetailValue>{format(new Date(booking.date), 'MMMM d, yyyy, HH:mm')}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Price</DetailLabel>
          <DetailValue>{booking.price} лв.</DetailValue>
        </DetailRow>
      </BookingDetails>

      <Message>
        A confirmation email has been sent to your email address. If you need to cancel or reschedule your appointment, 
        please contact us through our official Instagram page or give us a call at least 24 hours before your appointment.
      </Message>

      <ReturnButton onClick={() => navigate('/')}>
        <FontAwesomeIcon icon={faHome} />
        Back to Home
      </ReturnButton>
    </Container>
  );
};

export default ThankYou; 