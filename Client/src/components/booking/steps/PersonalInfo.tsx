import styled from 'styled-components';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import CountrySelector from './CountrySelector';
import { processPhoneNumber } from './CountrySelector';

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
`;

const StepWrapper = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 2rem auto;
  padding: 1.5rem 2rem;
  background: transparent;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 1rem 0.5rem;
    max-width: 100vw;
  }
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
  @media (max-width: 600px) {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  & > * {
    min-width: 0;
    flex: 1 1 0;
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

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

interface PersonalInfoProps {
  onDetailsSubmit: (details: { 
    firstname: string; 
    lastname: string; 
    email: string; 
    phone: string;
    termsAccepted: boolean;
  }) => void;
}

const PersonalInfo = ({ onDetailsSubmit }: PersonalInfoProps) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
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
    email: '',
    phone: '',
    terms: ''
  });

  const validateForm = () => {
    const newErrors = {
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      terms: ''
    };

    if (!formData.firstname.trim()) {
      newErrors.firstname = 'Please enter your firstname';
    }

    if (!formData.lastname.trim()) {
      newErrors.lastname = 'Please enter your lastname';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your email address';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
      formData.lastname.trim() !== '' &&
      formData.email.trim() !== '' &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
      formData.phone.trim() !== '' &&
      formData.termsAccepted
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onDetailsSubmit({
        ...formData,
        phone: `${selectedCountry.dialCode} ${formData.phone}`
      });
      // Auto-redirect to the next step after a short delay
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('stepChange', { detail: 4 }));
      }, 100);
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
    
    // Only allow numbers, spaces, and plus sign
    if (!/^[0-9+ ]*$/.test(input)) {
      return;
    }
    
    const { country, phoneWithoutCode } = processPhoneNumber(input);
    
    if (country) {
      // Update the selected country
      setSelectedCountry(country);
      // Update the phone input with the number without country code
      setFormData(prev => ({
        ...prev,
        phone: phoneWithoutCode
      }));
    } else {
      // If no country code detected, just update the phone number normally
      setFormData(prev => ({
        ...prev,
        phone: input
      }));
    }
  };

  return (
    <Container>
      <StepWrapper>
        <Title>Basic Details</Title>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Label>
              Firstname
              {!formData.firstname && <Required>*</Required>}
            </Label>
            <Input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              placeholder="Enter your firstname"
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
              Lastname
              {!formData.lastname && <Required>*</Required>}
            </Label>
            <Input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              placeholder="Enter your lastname"
            />
            {errors.lastname && (
              <ErrorContainer>
                <ErrorIcon icon={faExclamationCircle} />
                {errors.lastname}
              </ErrorContainer>
            )}
          </InputGroup>

          <InputGroup>
            <Label>
              Email Address
              {!formData.email && <Required>*</Required>}
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email address"
            />
            {errors.email && (
              <ErrorContainer>
                <ErrorIcon icon={faExclamationCircle} />
                {errors.email}
              </ErrorContainer>
            )}
          </InputGroup>

          <InputGroup>
            <Label>
              Phone Number
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
                placeholder="048 123 456"
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
              I agree with the <TermsLink href="#">terms & conditions</TermsLink>
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
            $isDisabled={!isFormValid()}
            disabled={!isFormValid()}
          >
            Continue to Summary
          </SubmitButton>
        </Form>
      </StepWrapper>
    </Container>
  );
};

export default PersonalInfo; 