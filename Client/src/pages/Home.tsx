import React from 'react';
import styled from 'styled-components';
import Hero from '../components/Hero';
import EmbeddedBooking from '../components/EmbeddedBooking';
import Footer from '../components/Footer';
import StaffShowcase from '../components/StaffShowcase';
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
  return (
    <HomeContainer>
      <Hero />
      <ServiceList />
      <ScrollToBookingButton />
      {/* <StaffShowcase /> */}
      <BookingSection>
        <EmbeddedBooking />
      </BookingSection>
      <Footer />
    </HomeContainer>
  );
};

export default Home;