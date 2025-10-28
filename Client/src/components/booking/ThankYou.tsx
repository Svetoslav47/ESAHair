import styled from 'styled-components';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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

const Subtitle = styled.h2`
  color: #fff;
  font-size: 2.5rem;
  font-weight: 700;
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
  priceEUR?: number;
  priceBGN?: number;
  bookingId: string;
  numberOfPeople: number;
}

const ThankYou: React.FC<{ booking: BookingConfirmation }> = ({ booking }) => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container>
      <SuccessIcon>
        <FontAwesomeIcon icon={faCheckCircle} />
      </SuccessIcon>
      
      <Subtitle>Вашата резервация е потвърдена</Subtitle>

      <BookingDetails>
        <DetailRow>
          <DetailLabel>Име на клиент</DetailLabel>
          <DetailValue>{booking.customerName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Услуга</DetailLabel>
          <DetailValue>{booking.serviceName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Фризьор</DetailLabel>
          <DetailValue>{booking.barberName}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Дата и час</DetailLabel>
          <DetailValue>
            {booking.date.split('T')[0]} {booking.date.split('T')[1].substring(0, 5)}
          </DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Брой хора</DetailLabel>
          <DetailValue>{booking.numberOfPeople}</DetailValue>
        </DetailRow>
        <DetailRow>
          <DetailLabel>Сума</DetailLabel>
          <DetailValue>
            <span style={{ color: '#fff', fontWeight: 500 }}>{((booking.priceBGN ?? 0) * booking.numberOfPeople).toFixed(2)} лв.</span>
            <span style={{ color: '#999', fontSize: '0.9rem', marginLeft: '0.5rem', opacity: 0.7 }}> / {((booking.priceEUR ?? 0) * booking.numberOfPeople).toFixed(2)} EUR</span>
          </DetailValue>
        </DetailRow>
      </BookingDetails>

      <Message>
        Потвърждение на резервацията е изпратено на вашият имейл. Ако трябва да отмените или пренаредите вашата резервация, 
        моля, свържете се с нас чрез официалния Instagram страница или по телефона.
      </Message>

      <ReturnButton onClick={() => navigate('/')}>
        <FontAwesomeIcon icon={faHome} />
        Към началната страница
      </ReturnButton>
    </Container>
  );
};

export default ThankYou; 