import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  max-width: 600px;
  margin: 0 auto;
  background-color: #000;
  border-radius: 8px;
`;

const Title = styled.h2`
  color: #C19B76;
  text-align: left;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const Summary = () => {
  return (
    <Container>
      <Title>Summary</Title>
    </Container>
  );
};

export default Summary; 