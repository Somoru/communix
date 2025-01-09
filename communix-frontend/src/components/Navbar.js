import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import logo from '../images/logo.jpg';

const Nav = styled.nav`
  padding: 0.5rem 1rem;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  position: relative;
`;

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  position: relative;
  z-index: 1001;  // Higher z-index
  background-color: #fff;
`;

const Logo = styled.img`
  height: 40px;
  width: auto;
  margin-right: 1rem;
`;

const BrandName = styled.span`
  font-size: 2rem;
  font-weight: bold;
  color: black;
`;

const NavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
  z-index: 1002;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  text-decoration: none;
  color: black;
  font-size: 1.25rem;
  font-weight: bold;
  transition: color 0.3s ease;

  &:hover {
    color: #95B2B0;
  }
`;

const SignupButton = styled.button`
  background-color: rgb(0, 10, 200);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #020887;
  }
`;

const Button = styled.button`
  color: black;
  background-color: transparent;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 2rem;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #95B2B0;
  }
`;

const MenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  z-index: 1002;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileNavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 1rem;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  background-color: #fff;
  transform: translateY(${({ $isOpen }) => ($isOpen ? '0' : '-100%')});
  transition: transform 0.3s ease-in-out;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 999;  // Lower z-index
  visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};

  @media (min-width: 769px) {
    display: none;
  }

  li {
    margin: 1rem 0;
    text-align: center;
  }
`;

const UserDropdown = styled.div`
  position: relative;
  display: inline-block;

  &:hover > div {
    display: block;
  }
`;

const DropdownContent = styled.div`
  display: none;
  position: absolute;
  right: 0;
  min-width: 160px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 0.5rem;
  padding: 0.5rem 0;
  z-index: 1001;
`;

const DropdownItem = styled(Link)`
  display: block;
  padding: 0.5rem 1rem;
  text-decoration: none;
  color: black;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #f5f5f5;
  }
`;

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isOnboardingPage = location.pathname === '/onboarding';
  const isWaitingPage = location.pathname === '/waiting-list';

  return (
    <Nav>
      <NavContainer>
        <LogoContainer to="/">
          <Logo src={logo} alt="Logo" />
          <BrandName>Communix</BrandName>
        </LogoContainer>

        <MenuButton onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </MenuButton>

        <NavLinks>
          {(isOnboardingPage || isWaitingPage) ? (
            <UserDropdown>
              <Button>User</Button>
              <DropdownContent>
                <DropdownItem to="/my-account">My Account</DropdownItem>
                <DropdownItem to="/">Log Out</DropdownItem>
              </DropdownContent>
            </UserDropdown>
          ) : (
            <>
              <li>
                <NavLink to="/signup">
                  <SignupButton>Sign Up</SignupButton>
                </NavLink>
              </li>
              <li>
                <NavLink to="/login">
                  <Button>Log In</Button>
                </NavLink>
              </li>
            </>
          )}
        </NavLinks>

        <MobileNavLinks $isOpen={isOpen}>
          {(isOnboardingPage || isWaitingPage) ? (
            <>
              <li>
                <NavLink to="/my-account" onClick={() => setIsOpen(false)}>My Account</NavLink>
              </li>
              <li>
                <NavLink to="/" onClick={() => setIsOpen(false)}>Log Out</NavLink>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/signup" onClick={() => setIsOpen(false)}>Sign Up</NavLink>
              </li>
              <li>
                <NavLink to="/login" onClick={() => setIsOpen(false)}>Log In</NavLink>
              </li>
            </>
          )}
        </MobileNavLinks>
      </NavContainer>
    </Nav>
  );
}

export default Navbar;