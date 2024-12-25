import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function OnboardingPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [questions, setQuestions] = useState([]); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOnboardingQuestions = async () => {
      try {
        const response = await axios.get('/onboarding-questions'); // Replace with your actual endpoint
        setQuestions(response.data); 
      } catch (error) {
        console.error('Error fetching onboarding questions:', error);
        setError('Failed to load onboarding questions.');
      } finally {
        setIsLoading(false); 
      }
    };

    fetchOnboardingQuestions();
  }, []);

  const handleAnswerChange = (answer) => {
    // Update the answers array with the new answer for the current question
    setAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[currentQuestionIndex] = answer;
      return newAnswers;
    });
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  const handleSubmit = async () => {
    try {
      // Assuming your API endpoint to store onboarding answers is /users/onboarding
      await axios.post('/users/onboarding', { answers }); 
      navigate('/waiting-list');
    } catch (error) {
      console.error('Failed to submit answers:', error);
      setError('Failed to submit answers. Please try again.');
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading questions...</div>; 
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  if (currentQuestionIndex >= questions.length) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Thank you for completing the onboarding!
        </h2>
        <p>You will be redirected to the waiting list page shortly.</p>
        {handleSubmit()} {/* Automatically submit answers and redirect */}
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Onboarding</h2>
      <div className="mb-4">
        <p className="text-lg font-medium text-gray-700">{currentQuestion.text}</p>
        {/* Render answer options based on question type (e.g., radio buttons, dropdown) */}
        {/* ... */}
      </div>
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default OnboardingPage;