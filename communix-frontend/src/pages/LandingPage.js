import React from 'react';
import { Link } from 'react-router-dom';
import illustration from '../images/illustration.png'; // Ensure the correct path to your image
import './LandingPage.css'; // Import the custom CSS for the button animation

function LandingPage() {
  return (
    <main className="flex flex-col lg:flex-row items-center justify-center w-full h-screen overflow-hidden bg-white pt-20 lg:pt-24">
      {/* Left Section */}
      <div className="text-center lg:text-left lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <h1 className="text-5xl lg:text-8xl mb-6 leading-tight font-normal">
          Welcome to
          <br />
          <span className="block text-6xl lg:text-9xl font-normal">Communix</span>
        </h1>
        <p className="text-2xl lg:text-4xl mb-8 font-normal">
          Find Your People. Build Your Community.
        </p>
        <div>
          <Link to="/signup">
            <button className="text-2xl lg:text-3xl py-4 px-10 rounded-full transition-all duration-500 ease-in-out">
              <span>GET STARTED</span>
            </button>
          </Link>
          <p className="mt-6 text-xl lg:text-2xl font-normal">
            Already a Member?{" "}
            <Link to="/login" className="text-blue-500 underline">
              Login
            </Link>
          </p>
        </div>
      </div>

      {/* Right Section */}
      <div className="lg:w-1/2 flex justify-center items-center">
        <img
          src={illustration}
          alt="Community Illustration"
          className="w-full max-w-lg lg:max-w-2xl"
        />
      </div>
    </main>
  );
}

export default LandingPage;