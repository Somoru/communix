import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { studentQuestions, professionalQuestions } from "../questions";

const OnboardingContainer = styled.div`
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
  }  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const OnboardingContent = styled.div`
  background-color: #fff;
  padding: 3rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  width: 100%;
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 2rem;
`;

const QuestionContainer = styled.div`
  margin-bottom: 2rem;
`;

const QuestionText = styled.p`
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #555;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionCard = styled.div`
  padding: 1rem;
  border: 2px solid ${({ selected }) => (selected ? "#C6EBBE" : "#e9ecef")};
  border-radius: 0.5rem;
  background-color: ${({ selected }) => (selected ? "#C6EBBE" : "#fff")};
  color: ${({ selected }) => (selected ? "black" : "#333")};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: ${({ selected }) => (selected ? "#C6EBBE" : "#f1f3f5")};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: #334195;
  color: #fff;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.25rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #0056b3;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

function OnboardingPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profession, setProfession] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfession = async () => {
      try {
        const storedProfession = localStorage.getItem("profession");
        if (storedProfession) {
          setProfession(storedProfession);
        } else {
          navigate("/signup");
        }
      } catch (error) {
        setError("Failed to load user data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfession();
  }, [navigate]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers((prevAnswers) => {
      const newAnswers = [...prevAnswers];
      if (!newAnswers[questionIndex]) {
        newAnswers[questionIndex] = { question: questions[questionIndex].text, answers: [] };
      }

      let updatedAnswers;
      if (questionIndex === 0) {
        updatedAnswers = [answer];
      } else {
        updatedAnswers = newAnswers[questionIndex].answers.includes(answer)
          ? newAnswers[questionIndex].answers.filter((a) => a !== answer)
          : [...newAnswers[questionIndex].answers, answer];
      }

      newAnswers[questionIndex] = { ...newAnswers[questionIndex], answers: updatedAnswers };
      return newAnswers;
    });
  };

  const handleNext = () => {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");
      await axios.put(
        `auth/users/${userId}/onboarding`,
        { onboardingAnswers: answers },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/waiting-list");
    } catch (error) {
      setError("Failed to submit answers. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const questions =
    profession === "student" ? studentQuestions : professionalQuestions;

  const allQuestionsAnswered =
    answers.length === questions.length &&
    answers.every((answer) => answer !== undefined);

  if (currentQuestionIndex >= questions.length && allQuestionsAnswered) {
    handleSubmit();
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Thank you for completing the onboarding!
        </h2>
        <p>You will be redirected to the waiting list page shortly.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <OnboardingContainer>
      <OnboardingContent>
        <Title>Onboarding</Title>
        <QuestionContainer>
          <QuestionText>{currentQuestion.text}</QuestionText>
          <AnswerOptions>
            {currentQuestion.options.map((option, index) => (
              <OptionCard
                key={index}
                selected={
                  answers[currentQuestionIndex] &&
                  answers[currentQuestionIndex].answers.includes(option)
                }
                onClick={() => handleAnswerChange(currentQuestionIndex, option)}
              >
                {option}
              </OptionCard>
            ))}
          </AnswerOptions>
        </QuestionContainer>
        <ButtonContainer>
          <Button onClick={handleBack} disabled={currentQuestionIndex === 0}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={!answers[currentQuestionIndex]}>
            Next
          </Button>
        </ButtonContainer>
      </OnboardingContent>
    </OnboardingContainer>
  );
}

export default OnboardingPage;
