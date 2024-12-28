import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import illustration from '../images/illustration.png';
import Navbar from '../components/Navbar';

const LandingPageContainer = styled.div`
  display: flex;
  background: linear-gradient(40deg, white 35%,#C6EBBE 100%);
  background-size: 150% 100%;
  animation: backgroundMove 15s ease infinite;

  @keyframes backgroundMove {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  flex-direction: column; 
  align-items: center;
  justify-content: center;
  min-height: 100vh; 
  
  padding: 2rem; 
  box-sizing: border-box; 

  @media (min-width: 1024px) { 
    flex-direction: row; 
    text-align: left; 
  }
`;

const ContentWrapper = styled.div`
  text-align: center; 
  margin-bottom: 2rem; 

  @media (min-width: 1024px) { 
    width: 100%; 
    padding-right: 4rem; 
    text-align: left;
    margin-bottom: 0;
    margin-top: 0rem;
    margin-left: 9rem;
  }
`;

const Heading = styled.h1`
  font-size: 3rem; 
  color: black; 
  margin-bottom: 1rem; 
  font-style: bold;
  margin-top: 2.5rem;


  @media (min-width: 1024px) { 
    font-size: 4rem; 
  }

  @media (max-width: 760px) {
  margin-top: 2.5rem;
}
`;

const Tagline = styled.p`
  font-size: 1.25rem; 
  color: #020887;
  margin-bottom: 2rem; 
  

  @media (min-width: 1024px) { 
    font-size: 1.5rem; 
  }
`;




function LandingPage() {
  return (
    <LandingPageContainer>
      <ContentWrapper>
        <Heading>
          Contact Us
        </Heading>
        <Tagline>
          Email: team@communix.co<br />
          Contact Number: +91 63098 49388
        </Tagline>
      </ContentWrapper>
    </LandingPageContainer>
  );
}

export default LandingPage;