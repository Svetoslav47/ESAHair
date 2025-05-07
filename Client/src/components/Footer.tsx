import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone } from '@fortawesome/free-solid-svg-icons';
import { faInstagram } from '@fortawesome/free-brands-svg-icons';
import { faMapLocationDot } from '@fortawesome/free-solid-svg-icons';

const FooterContainer = styled.footer`
  background-color: #000;
  color: #fff;
  padding: 4rem 2rem;
  border-top: 1px solid #333;
`;

const FooterContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4rem;
  padding: 0 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SectionTitle = styled.h3`
  color: #C19B76;
  font-size: 1.4rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  padding-bottom: 0.8rem;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 2px;
    background-color: #C19B76;
  }
`;

const Address = styled.address`
  font-style: normal;
  color: #fff;
  line-height: 1.8;
  font-size: 1.1rem;
`;

const AddressLink = styled.a`
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  color: #C19B76;

  svg {
    font-size: 1rem;
  }

  &:hover {
    color: #fff;
    transform: translateX(5px);
  }
`;

const ContactLink = styled.a`
  color: #fff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  padding: 0.5rem 0;

  svg {
    font-size: 1.3rem;
    color: #C19B76;
  }

  &:hover {
    color: #C19B76;
    transform: translateX(5px);
  }
`;

const Copyright = styled.div`
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #333;
  color: #666;
  font-size: 0.9rem;
`;

const PoweredBy = styled.div`
  text-align: center;
  margin-top: 1rem;
  color: #666;
  font-size: 0.9rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <SectionTitle>Салон 1</SectionTitle>
          <Address>
            Женски пазар, София<br />
            ул. "Св. св. Кирил и Методий" 102
            <AddressLink 
              href="https://maps.app.goo.gl/YZVxhBk8qMdiiCnp8" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
              Отвори в Google Maps
            </AddressLink>
          </Address>
        </FooterSection>

        <FooterSection>
          <SectionTitle>Салон 2</SectionTitle>
          <Address>
            София, София<br />
            ул. "Пиротска" 21
            <AddressLink 
              href="https://maps.app.goo.gl/n1uhcNtf9RTAQKtT6" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <FontAwesomeIcon icon={faMapLocationDot} />
              Отвори в Google Maps
            </AddressLink>
          </Address>
        </FooterSection>

        <FooterSection id="contacts">
          <SectionTitle>Контакти</SectionTitle>
          <ContactLink href="tel:+359890139334">
            <FontAwesomeIcon icon={faPhone} />
            +359 890 139 334
          </ContactLink>
          <ContactLink 
            href="https://www.instagram.com/mx_zaki/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <FontAwesomeIcon icon={faInstagram} />
            @mx_zaki
          </ContactLink>
        </FooterSection>
      </FooterContent>

      <Copyright>
        © {new Date().getFullYear()} МХ ЗАКИ. Всички права запазени.
      </Copyright>
      <PoweredBy>
        Powered by ESA Consult
      </PoweredBy>
    </FooterContainer>
  );
};

export default Footer;
