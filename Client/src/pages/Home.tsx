import Hero from '../components/Hero';
import styled from 'styled-components';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

function Home() {
  return (
    <HomeContainer>
      <Hero />
    </HomeContainer>
  );
}

export default Home;