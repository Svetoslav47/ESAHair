import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import Hero from '../components/Hero';
import EmbeddedBooking from '../components/EmbeddedBooking';
import Footer from '../components/Footer';
import ServiceList from '../components/ServiceList';
import ScrollToBookingButton from '../components/ScrollToBookingButton';

const HomeContainer = styled.div`
  min-height: 100vh;
  background-color: #000;
`;

const BookingSection = styled.section`
  padding: 4rem 2rem;
  background-color: #000;
`;

const Home = () => {
  const bookingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isMobile = () => window.innerWidth <= 768;
    let lockActive = false;
    let bookingTop = 0;

    const onScroll = () => {
      if (!isMobile() || !bookingRef.current) return;
      bookingTop = bookingRef.current.getBoundingClientRect().top + window.scrollY;
      if (window.scrollY >= bookingTop) {
        lockActive = true;
      }
      if (lockActive && window.scrollY < bookingTop) {
        window.scrollTo({ top: bookingTop, behavior: 'auto' });
      }
    };

    window.addEventListener('scroll', onScroll, { passive: false });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <HomeContainer>
      <Hero />
      <ServiceList />
      <ScrollToBookingButton />
      {/* <StaffShowcase /> */}
      <BookingSection id="book-now" ref={bookingRef}>
        <EmbeddedBooking />
      </BookingSection>
      <Footer />
    </HomeContainer>
  );
};

export default Home;