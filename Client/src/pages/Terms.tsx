import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 700px;
  margin: 3rem auto;
  padding: 2rem 2rem 3rem 2rem;
  background: #181818;
  border-radius: 10px;
  color: #fff;
  box-shadow: 0 2px 16px rgba(0,0,0,0.08);
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  text-align: center;
`;

const SectionTitle = styled.h2`
  font-size: 1.2rem;
  color: #C19B76;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  margin-bottom: 1rem;
  line-height: 1.7;
`;

const BackButton = styled.button`
  display: block;
  margin: 2.5rem auto 0 auto;
  padding: 0.9rem 2.5rem;
  background-color: #C19B76;
  color: #000;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background-color: #D4B08C;
  }
`;

const Terms = () => {
  const navigate = useNavigate();
  return (
    <Container>
      <Title>Общи условия за използване на уебсайта</Title>
      <Paragraph>
        С достъпа до този уебсайт и използването на системата за онлайн резервации, Вие се съгласявате със следните условия:
      </Paragraph>
      <SectionTitle>Резервации</SectionTitle>
      <Paragraph>
        Чрез уебсайта можете да запазите час за услуга във фризьорския ни салон. За потвърждение на резервацията се изискват Вашето име и телефонен номер.
      </Paragraph>
      <SectionTitle>Съхранение на лични данни</SectionTitle>
      <Paragraph>
        При направена резервация, ние съхраняваме Вашето име и телефонен номер с цел:
      </Paragraph>
      <ul>
        <li>Потвърждаване на резервацията;</li>
        <li>Напомняне за предстоящ час;</li>
        <li>Свързване с Вас при промяна или отмяна на резервацията.</li>
      </ul>
      <SectionTitle>Защита на личните данни</SectionTitle>
      <Paragraph>
        Личните Ви данни се съхраняват сигурно и няма да бъдат предоставяни на трети лица, освен при законово изискване. Можете по всяко време да поискате достъп до тези данни, тяхната корекция или изтриване, като се свържете с нас.
      </Paragraph>
      <SectionTitle>Отказ или промяна на час</SectionTitle>
      <Paragraph>
        Молим да ни уведомите възможно най-рано при нужда от промяна или отказ на резервация. Запазваме си правото да отменим резервация при извънредни обстоятелства.
      </Paragraph>
      <SectionTitle>Промени в условията</SectionTitle>
      <Paragraph>
        Запазваме си правото да актуализираме тези условия при нужда. Всички промени ще бъдат публикувани на тази страница.
      </Paragraph>
      <BackButton onClick={() => navigate('/')}>Към начална страница</BackButton>
    </Container>
  );
};

export default Terms; 