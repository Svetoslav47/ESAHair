import styled from 'styled-components';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import CountrySelector from './CountrySelector';
import { processPhoneNumber } from './CountrySelector';
import { BookingState } from '../../../types/bookingState';
import { bookAppointment } from '../../../services/api';
import { getServicePriceBGN, getServicePriceEUR } from '../../../utils/servicePrice';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
  margin: 0 auto;
  background: transparent;
  border-radius: 0;
  border: none;
  color: #fff;
  box-sizing: border-box;
  max-width: 100vw;
  width: 100%;
  overflow-x: hidden;
  @media (max-width: 480px) {
    padding: 0.5rem 0;
    gap: 1rem;
  }
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
  box-sizing: border-box;
  @media (max-width: 768px) {
    padding: 1rem 1rem;
    margin: 1rem auto;
  }
  @media (max-width: 480px) {
    padding: 1rem 0.75rem;
    margin: 0.5rem auto;
    max-width: 100vw;
  }
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: clamp(1.5rem, 5vw, 2.5rem);
  font-weight: bold;
  margin-top: 0;
  letter-spacing: 2px;
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    letter-spacing: 1px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: #fff;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const Required = styled.span`
  color: #ff4444;
`;

const Input = styled.input`
  padding: 0.8rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #111;
  color: #fff;
  font-size: 1rem;
  transition: all 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #C19B76;
  }

  &::placeholder {
    color: #666;
  }
`;

const PhoneInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 0.5rem;
  }
  & > * {
    min-width: 0;
  }
  & > *:first-child {
    flex: 0 0 auto;
    @media (max-width: 480px) {
      width: 100%;
    }
  }
  & > *:last-child {
    flex: 1;
    @media (max-width: 480px) {
      width: 100%;
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ff4444;
  font-size: 0.9rem;
  margin-top: 0.25rem;
`;

const ErrorIcon = styled(FontAwesomeIcon)`
  font-size: 1rem;
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Checkbox = styled.input`
  margin-top: 0.25rem;
`;

const TermsText = styled.label`
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
`;

const TermsLink = styled.a`
  color: #C19B76;
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const SubmitButton = styled.button<{ $isDisabled: boolean }>`
  padding: 1rem;
  background-color: ${({ $isDisabled }) => ($isDisabled ? '#333' : '#C19B76')};
  color: ${({ $isDisabled }) => ($isDisabled ? '#666' : '#000')};
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s ease;
  margin-top: 1rem;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: ${({ $isDisabled }) => ($isDisabled ? '#333' : '#D4B08C')};
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

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

interface PersonalInfoProps {
  onDetailsSubmit: (details: { 
    firstname: string; 
    phone: string;
    termsAccepted: boolean;
  }) => void;
  bookingState?: BookingState;
}

const PersonalInfo = ({ onDetailsSubmit, bookingState }: PersonalInfoProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    phone: '',
    termsAccepted: false
  });

  const [selectedCountry, setSelectedCountry] = useState<Country>({
    name: 'Bulgaria',
    code: 'BG',
    dialCode: '+359',
    flag: 'https://flagcdn.com/bg.svg'
  });

  const [errors, setErrors] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    terms: ''
  });

  const validateForm = () => {
    const newErrors = {
      firstname: '',
      lastname: '',
      phone: '',
      terms: ''
    };

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Please enter your firstname';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Please enter your phone number';
    }

    if (!formData.termsAccepted) {
      newErrors.terms = 'Please tick this box if you want to proceed';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const isFormValid = () => {
    return (
      formData.firstname.trim() !== '' &&
      formData.phone.trim() !== '' &&
      formData.termsAccepted
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const finalDetails = {
        ...formData,
        phone: `${selectedCountry.dialCode} ${formData.phone}`
      };
      
      onDetailsSubmit(finalDetails);
      
      // Make the booking
      setIsLoading(true);
      try {
        const { service, staff, dateTime, numberOfPeople = 1 } = bookingState || {};
        
        const appointment = {
          barberName: staff?.name || '',
          customerEmail: '',
          customerPhone: finalDetails.phone,
          customerName: finalDetails.firstname,
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
              customerName: finalDetails.firstname,
              serviceName: service?.name,
              barberName: staff?.name,
              date: dateTime?.start,
              priceEUR: getServicePriceEUR(service),
              priceBGN: getServicePriceBGN(service),
              bookingId: data.bookingId,
              numberOfPeople
            }
          }
        });
      } catch (error) {
        console.error('Error booking appointment:', error);
        alert('Неуспешна резервация. Моля опитайте отново.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    
    // Only allow numbers and spaces
    if (!/^[0-9 ]*$/.test(input)) {
      return;
    }
    
    // Remove leading zero if present
    const formattedInput = input.startsWith('0') ? input.substring(1) : input;
    
    setFormData(prev => ({
      ...prev,
      phone: formattedInput
    }));
  };

  return (
    <Container>
      <StepWrapper>
        <Title>Основни Данни</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>
              Име
              {!formData.firstname && <Required>*</Required>}
            </Label>
            <Input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Въведете вашето име"
            />
            {errors.firstname && (
              <ErrorContainer>
                <ErrorIcon icon={faExclamationCircle} />
                {errors.firstname}
              </ErrorContainer>
            )}
          </InputGroup>

          <InputGroup>
            <Label>
              Телефонен номер
              {!formData.phone && <Required>*</Required>}
            </Label>
            <PhoneInputContainer>
              <CountrySelector
                selectedCountry={selectedCountry}
                onSelect={setSelectedCountry}
              />
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="48 123 456"
                style={{ flex: 1 }}
              />
            </PhoneInputContainer>
            {errors.phone && (
              <ErrorContainer>
                <ErrorIcon icon={faExclamationCircle} />
                {errors.phone}
              </ErrorContainer>
            )}
          </InputGroup>

          <CheckboxGroup>
            <Checkbox
              type="checkbox"
              name="termsAccepted"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <TermsText>
              Съгласен съм с <TermsLink href="/terms">условията за ползване</TermsLink>
            </TermsText>
          </CheckboxGroup>
          {errors.terms && (
            <ErrorContainer>
              <ErrorIcon icon={faExclamationCircle} />
              {errors.terms}
            </ErrorContainer>
          )}

          <SubmitButton 
            type="submit" 
            $isDisabled={!isFormValid() || isLoading}
            disabled={!isFormValid() || isLoading}
          >
            {isLoading ? 'Зареждане...' : 'Резервирай'}
          </SubmitButton>
        </Form>
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

export default PersonalInfo; 