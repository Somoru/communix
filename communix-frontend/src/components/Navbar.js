import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../images/logo.jpg'; // Ensure the correct path to your logo image

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-white py-4 px-6 fixed w-full z-10">
      <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center text-3xl font-bold text-gray-800">
          <img src={logo} alt="Logo" className="h-16 w-16 mr-2 object-cover" />
          Communix
        </Link>
        <div className="lg:hidden">
          <button onClick={toggleMenu} className="text-gray-800 focus:outline-none bg-transparent">
            <svg className="w-6 h-6" fill="none" stroke="black" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
            </svg>
          </button>
        </div>
        <ul className={`flex-col lg:flex-row lg:flex space-x-8 ${isOpen ? 'flex' : 'hidden'} lg:space-x-8 lg:items-center mt-4 lg:mt-0`}>
          <li>
            <Link
              to="/signup"
              className="text-xl lg:text-2xl py-2 px-4 text-gray-800 hover:text-cyan-500 transition"
            >
              Sign Up
            </Link>
          </li>
          <li>
            <Link
              to="/login"
              className="text-xl lg:text-2xl py-2 px-4 text-gray-800 hover:text-blue-500 transition"
            >
              Log In
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;