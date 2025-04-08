import styled from 'styled-components';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  position: relative;
  width: 120px;
`;

const SelectedCountry = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem;
  border: 1px solid #333;
  border-radius: 4px;
  background-color: #111;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #C19B76;
  }

  ${({ $isOpen }) => $isOpen && `
    border-color: #C19B76;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  `}
`;

const Flag = styled.img`
  width: 20px;
  height: 14px;
  object-fit: cover;
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: #111;
  border: 1px solid #C19B76;
  border-top: none;
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  z-index: 1000;
  display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #111;
  }

  &::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #444;
  }
`;

const CountryOption = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  span {
    flex: 1;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &:hover {
    background-color: #222;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  border: none;
  border-bottom: 1px solid #333;
  background-color: #111;
  color: #fff;
  font-size: 0.85rem;

  &:focus {
    outline: none;
    border-bottom-color: #C19B76;
  }

  &::placeholder {
    color: #666;
  }
`;

const DialCode = styled.span`
  color: #999;
  font-size: 0.8rem;
  white-space: nowrap;
  min-width: fit-content;
`;

interface Country {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

// This is just a sample of countries. In a real app, you'd want to include all countries
const countries: Country[] = [
  { name: 'Afghanistan', code: 'AF', dialCode: '+93', flag: 'https://flagcdn.com/af.svg' },
  { name: 'Albania', code: 'AL', dialCode: '+355', flag: 'https://flagcdn.com/al.svg' },
  { name: 'Algeria', code: 'DZ', dialCode: '+213', flag: 'https://flagcdn.com/dz.svg' },
  { name: 'Bulgaria', code: 'BG', dialCode: '+359', flag: 'https://flagcdn.com/bg.svg' },
  { name: 'France', code: 'FR', dialCode: '+33', flag: 'https://flagcdn.com/fr.svg' },
  { name: 'Germany', code: 'DE', dialCode: '+49', flag: 'https://flagcdn.com/de.svg' },
  { name: 'Greece', code: 'GR', dialCode: '+30', flag: 'https://flagcdn.com/gr.svg' },
  { name: 'Italy', code: 'IT', dialCode: '+39', flag: 'https://flagcdn.com/it.svg' },
  { name: 'Romania', code: 'RO', dialCode: '+40', flag: 'https://flagcdn.com/ro.svg' },
  { name: 'Spain', code: 'ES', dialCode: '+34', flag: 'https://flagcdn.com/es.svg' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', flag: 'https://flagcdn.com/gb.svg' },
  { name: 'United States', code: 'US', dialCode: '+1', flag: 'https://flagcdn.com/us.svg' },
];

interface CountrySelectorProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
  onPhoneInput?: (phoneNumber: string) => void;
}

// Add utility function to find country by dial code
export const findCountryByDialCode = (dialCode: string): Country | undefined => {
  // Remove the '+' if present and clean up the input
  const cleanDialCode = dialCode.startsWith('+') ? dialCode : `+${dialCode}`;
  
  // Find the country with the matching dial code
  return countries.find(country => {
    // Some countries might have multiple dial codes, so we check if the input starts with the country's dial code
    return cleanDialCode.startsWith(country.dialCode);
  });
};

// Add utility function to process phone number input
export const processPhoneNumber = (phoneNumber: string): { country?: Country; phoneWithoutCode: string } => {
  if (!phoneNumber.startsWith('+')) {
    return { phoneWithoutCode: phoneNumber };
  }

  // Try to find a country match
  for (const country of countries) {
    if (phoneNumber.startsWith(country.dialCode)) {
      // Remove the country code from the phone number
      const phoneWithoutCode = phoneNumber.slice(country.dialCode.length);
      return { country, phoneWithoutCode };
    }
  }

  return { phoneWithoutCode: phoneNumber };
};

const CountrySelector = ({ selectedCountry, onSelect }: CountrySelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(search.toLowerCase()) ||
    country.dialCode.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <Container ref={containerRef}>
      <SelectedCountry onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        <Flag src={selectedCountry.flag} alt={selectedCountry.name} />
        <DialCode>{selectedCountry.dialCode}</DialCode>
        <FontAwesomeIcon icon={isOpen ? faChevronUp : faChevronDown} />
      </SelectedCountry>
      <DropdownContainer $isOpen={isOpen}>
        <SearchInput
          type="text"
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClick={(e) => e.stopPropagation()}
        />
        {filteredCountries.map((country) => (
          <CountryOption
            key={country.code}
            onClick={() => handleSelect(country)}
          >
            <Flag src={country.flag} alt={country.name} />
            <span>{country.name}</span>
            <DialCode>{country.dialCode}</DialCode>
          </CountryOption>
        ))}
      </DropdownContainer>
    </Container>
  );
};

export default CountrySelector; 