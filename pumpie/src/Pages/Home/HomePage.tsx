import React from 'react';
import styled from 'styled-components';
import LiveStreamList from '../../components/LiveStream/LiveStreamList';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Hero = styled.div`
  background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
  border-radius: 12px;
  padding: 40px;
  margin-bottom: 40px;
  color: white;
  text-align: center;
`;

const HeroTitle = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin: 0 0 16px 0;
`;

const HeroSubtitle = styled.p`
  font-size: 18px;
  margin: 0;
  opacity: 0.9;
`;

const HomePage: React.FC = () => {
  return (
    <Container>
      <Hero>
        <HeroTitle>Welcome to Pumpie Live</HeroTitle>
        <HeroSubtitle>
          Watch and interact with your favorite crypto and blockchain content creators
        </HeroSubtitle>
      </Hero>
      <LiveStreamList />
    </Container>
  );
};

export default HomePage;
