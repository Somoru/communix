// src/questions.js

export const studentQuestions = [
    {
      text: "What is your Profession?",
      options: ["Student", "Professional"],
    },

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
    // ... (other student questions with conditions) ...
  ];
  
  export const professionalQuestions = [
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