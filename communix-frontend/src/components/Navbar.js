import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../images/logo.jpg'; 

const Nav = styled.nav`
  background-color: #fff;
  padding: 0.5rem 1rem;
  position: fixed; 
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10; 
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px; 
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
`;

const Logo = styled.img`
  height: 40px; 
  width: auto; 
  margin-right: 1rem; 
`;

const BrandName = styled.span`
  font-size: 2rem; 
  font-weight: bold;
  color: #333; 
  text-decoration: none; /* Remove underline */
`;

const NavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem; 

  @media (max-width: 768px) {
    display: none; 
  }
`;

const NavLink = styled(Link)`
  text-decoration: none; 
  color: #555; 
  font-size: 1.25rem; /* Increased font size */
  font-weight: bold; /* Make the text bold */
  transition: color 0.3s ease; 

  &:hover {
    color: #007bff; 
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background-color: #fff;
  position: absolute;
  top: 60px;
  right: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};

  @media (min-width: 769px) {
    display: none;
  }
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Nav>
      <NavContainer>
        <LogoContainer to="/">
          <Logo src={logo} alt="Logo" />
          <BrandName>Communix</BrandName> 
        </LogoContainer>
        <MenuButton onClick={toggleMenu}>
          <svg 
            className="w-6 h-6" 
            fill="none" 
            stroke="currentColor"  
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path> 
          </svg>
        </MenuButton>
        <NavLinks>
          <li>
            <NavLink to="/signup">Sign Up</NavLink>
          </li>
          <li>
            <NavLink to="/login">Log In</NavLink>
          </li>
        </NavLinks>
        <MobileNavLinks $isOpen={isOpen}>
          <li>
            <NavLink to="/signup" onClick={toggleMenu}>Sign Up</NavLink>
          </li>
          <li>
            <NavLink to="/login" onClick={toggleMenu}>Log In</NavLink>
          </li>
        </MobileNavLinks>
      </NavContainer>
    </Nav>
  );
}

export default Navbar;