import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import illustration from '../images/illustration.png';

const LandingPageContainer = styled.div`
  display: flex;
  flex-direction: column; 
  align-items: center;
  justify-content: center;
  min-height: 100vh; 
  background-color: #fff; 
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
    width: 50%; 
    padding-right: 4rem; 
    text-align: left;
    margin-bottom: 0;
  }
`;

const Heading = styled.h1`
  font-size: 2.5rem; 
  font-weight: bold;
  color: #333; 
  margin-bottom: 1rem; 

  @media (min-width: 1024px) { 
    font-size: 4rem; 
  }
`;

const Tagline = styled.p`
  font-size: 1.25rem; 
  color: #555; 
  margin-bottom: 2rem; 

  @media (min-width: 1024px) { 
    font-size: 1.5rem; 
  }
`;

const Button = styled(Link)`
  display: inline-block;
  padding: 1rem 3rem; /* Increased padding */
  background-color: #007bff; 
  color: #fff;
  text-decoration: none;
  border-radius: 0.5rem; 
  font-size: 1.25rem; /* Increased font size */
  font-weight: bold;
  transition: background-color 0.3s ease; 

  &:hover {
    background-color: #0056b3; 
  }
`;

const Illustration = styled.img`
  max-width: 100%; /* Increased max-width */
  height: auto; 

  @media (min-width: 1024px) { 
    max-width: 600px; /* Increased max-width for larger screens */
  }
`;

const LoginText = styled.span`
  display: block;
  margin-top: 1.5rem; /* Increased margin */
  font-size: 1.25rem; /* Increased font size */
  color: #555;

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

function LandingPage() {
  return (
    <LandingPageContainer>
      <ContentWrapper>
        <Heading>
          Welcome to <br /> Communix
        </Heading>
        <Tagline>
          Communix empowers you to find your tribe, collaborate on shared goals, and create impactful relationships. 
          Join today to unlock opportunities and foster a stronger network.
        </Tagline>
        <Button to="/signup">REGISTER NOW</Button> <br />
        <LoginText>
          Already a Member? <Link to="/login">Login</Link>
        </LoginText>
      </ContentWrapper>
      <Illustration src={illustration} alt="Community Illustration" />
    </LandingPageContainer>
  );
}

export default LandingPage;