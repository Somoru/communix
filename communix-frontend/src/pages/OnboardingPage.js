import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

const OnboardingContainer = styled.div`
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  box-sizing: border-box;
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
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Option = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;

const Input = styled.input`
  margin-right: 0.5rem;
`;

const Label = styled.label`
  cursor: pointer;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
`;

const Button = styled.button`
  background-color: #007bff;
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

const studentQuestions = [
  {
    text: "What Are Your Primary Areas of Academic Interest?",
    options: [
      "Artificial Intelligence and Data Science",
      "Finance and Investments",
      "Startup and Entrepreneurship",
      "Marketing and Branding",
      "Human Resources and Talent Management",
      "Technology and Engineering",
      "Consulting and Advisory",
      "Healthcare and Life Sciences",
    ],
  },
  {
    text: "What Are Your Passions Outside of Academics?",
    options: [
      "Sports and Physical Activities",
      "Entertainment and Media",
      "Creative Arts",
      "Technology and Innovation",
      "Intellectual Pursuits",
      "Community and Social Engagement",
      "Outdoor and Adventure",
      "Culinary Arts",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Sports and Physical Activities",
    options: [
      "Cricket",
      "Football",
      "Badminton",
      "Table Tennis",
      "Basketball",
      "Volleyball",
      "Kabaddi",
      "Athletics",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Entertainment and Media",
    options: [
      "Watching Bollywood Movies",
      "Listening to Bollywood Music",
      "Streaming Regional Films",
      "Following Indian Television Shows",
      "Participating in Dance Forms like Bollywood Dance",
      "Engaging in Online Gaming",
      "Watching Web Series",
      "Following Celebrity News",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Creative Arts",
    options: [
      "Painting or Drawing",
      "Photography",
      "Writing (Creative Writing, Blogging)",
      "Playing a Musical Instrument",
      "Singing",
      "Acting or Drama",
      "Dancing",
      "Graphic Design",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Technology and Innovation",
    options: [
      "Coding and Programming",
      "App Development",
      "Robotics",
      "Web Design",
      "Game Development",
      "Digital Art",
      "Blogging or Vlogging",
      "Podcasting",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Intellectual Pursuits",
    options: [
      "Reading (Fiction or Non-fiction)",
      "Learning a New Language",
      "Chess",
      "Puzzles and Brain Teasers",
      "Research Projects",
      "Public Speaking",
      "Debating",
      "Quizzing",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Community and Social Engagement",
    options: [
      "Volunteering",
      "Social Activism",
      "Mentorship Programs",
      "Cultural Clubs",
      "Environmental Initiatives",
      "Event Planning",
      "Fundraising",
      "Peer Counseling",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Outdoor and Adventure",
    options: [
      "Traveling",
      "Trekking",
      "Camping",
      "Cycling",
      "Gardening",
      "Bird Watching",
      "Stargazing",
      "Fishing",
    ],
  },
  {
    text: "What are your specific interests in this area?",
    condition: (answers) => answers[1] === "Culinary Arts",
    options: [
      "Cooking",
      "Baking",
      "Brewing (Coffee, Tea, Beer)",
      "Food Photography",
      "Wine Tasting",
      "Gardening (Herbs and Vegetables)",
      "Food Blogging",
      "Culinary Competitions",
    ],
  },
];

const professionalQuestions = [
  {
    text: "What Are Your Key Professional Aspirations?",
    options: [
      "Artificial Intelligence and Data Science",
      "Finance and Investments",
      "Startup and Entrepreneurship",
      "Marketing and Branding",
      "Human Resources and Talent Management",
      "Technology and Engineering",
      "Consulting and Advisory",
      "Healthcare and Life Sciences",
    ],
  },
  {
    text: "What Are Your Passions Outside of Work?",
    options: [
      "Watching Movies",
      "Playing Musical Instruments",
      "Composing or Songwriting",
      "Participating in Team Sports",
      "Fitness Training",
      "Outdoor Adventures",
      "Reading Fiction",
      "Traveling and Exploring New Places",
    ],
  },
  {
    text: "Tell Us More About Your Professional Journey",
    question:
      "Which of the following best describes your current stage in your career?",
    options: [
      "Early Career (0-3 years of experience)",
      "Mid Career (4-10 years of experience)",
      "Senior Leadership (10+ years of experience)",
      "Entrepreneur/Founder",
      "Freelancer/Consultant",
      "Seeking Career Change",
      "Other",
    ],
  },
];

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
          console.error("Profession not found in local storage.");
          navigate("/signup");
        }
      } catch (error) {
        console.error("Error fetching profession:", error);
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
      newAnswers[questionIndex] = answer;
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
      await axios.put(`/users/${userId}/onboarding`, {
        onboardingAnswers: answers,
      });
      navigate("/waiting-list");
    } catch (error) {
      console.error("Failed to submit answers:", error);
      setError("Failed to submit answers. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading questions...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>;
  }

  const questionsToDisplay =
    profession === "student" ? studentQuestions : professionalQuestions;

  // Filter questions based on conditions
  const filteredQuestions = questionsToDisplay.filter((q, index) => {
    if (typeof q.condition === "function") {
      return q.condition(answers, index);
    }
    return true;
  });

  const allQuestionsAnswered =
    answers.length === filteredQuestions.length &&
    answers.every((answer) => answer !== undefined);

  if (
    currentQuestionIndex >= filteredQuestions.length &&
    allQuestionsAnswered
  ) {
    return (
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Thank you for completing the onboarding!
        </h2>
        <p>You will be redirected to the waiting list page shortly.</p>
        handleSubmit()
      </div>
    );
  }

  const currentQuestion = filteredQuestions[currentQuestionIndex];

  return (
    <OnboardingContainer>
      <OnboardingContent>
        <Title>Onboarding</Title>
        <QuestionContainer>
          <QuestionText>{currentQuestion.text}</QuestionText>
          <AnswerOptions>
            {currentQuestion.options &&
              currentQuestion.options.map((option, index) => (
                <Option
                  key={index}
                  onClick={() =>
                    handleAnswerChange(currentQuestionIndex, option)
                  }
                >
                  <Input
                    type="radio"
                    id={`option-${index}`}
                    name={`question-${currentQuestionIndex}`}
                    value={option}
                    checked={answers[currentQuestionIndex] === option}
                    onChange={() => {}}
                  />
                  <Label htmlFor={`option-${index}`}>{option}</Label>
                </Option>
              ))}
          </AnswerOptions>
        </QuestionContainer>
        <ButtonContainer>
          <Button onClick={handleBack} disabled={currentQuestionIndex === 0}>
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestionIndex]}
          >
            Next
          </Button>
        </ButtonContainer>
      </OnboardingContent>
    </OnboardingContainer>
  );
}

export default OnboardingPage;