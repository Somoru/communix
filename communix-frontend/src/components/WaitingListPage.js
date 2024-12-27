import React, {useState, useEffect} from "react";
import styled from 'styled-components';
const WaitingListContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
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
  }  padding: 2rem;
  box-sizing: border-box;
`;

const ContentWrapper = styled.div`
  text-align: center;
`;

const Heading = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.25rem;
  color: #555;
  margin-bottom: 2rem;
`;

const SocialLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 2rem;
`;

const SocialLink = styled.a`
  color: #007bff;
  font-size: 1.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: #0056b3;
  }
`;

function WaitingListPage() {
  const [userId, setUserId] = useState(''); 

  useEffect(() => {
    // Retrieve the userId from localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      // Handle the case where userId is not found (e.g., redirect to signup)
      console.error('User ID not found in local storage.');
      // You might want to redirect the user to the signup page here
    }
  }, []);
  return (
    <WaitingListContainer>
      <ContentWrapper>
        <Heading>
          Thank you for joining the Communix waiting list!
        </Heading>
        <Message>
          YOUR USERNAME IS <br />
          <span style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {userId}{/* Replace with actual username */}
            
          </span>
        </Message>
        <Message>
          Stay tuned for more updates - we'll reach out to you via
          email soon.
        </Message>
        <SocialLinks>
          <SocialLink href="#">
            {/* Replace with Instagram icon */}
            {/* <FontAwesomeIcon icon={faInstagram} /> */}
          </SocialLink>
          <SocialLink href="#">
            {/* Replace with WhatsApp icon */}
            {/* <FontAwesomeIcon icon={faWhatsapp} /> */}
          </SocialLink>
        </SocialLinks>
      </ContentWrapper>
    </WaitingListContainer>
  );
}

export default WaitingListPage;