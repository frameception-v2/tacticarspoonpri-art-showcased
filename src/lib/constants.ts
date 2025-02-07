export const PROJECT_ID = 'art-showcased';
export const PROJECT_TITLE = "Art Showcased Frame";
export const PROJECT_DESCRIPTION = "Interactive quiz about Maschine capabilities";

export const QUIZ_QUESTIONS = [
  {
    question: "What CAN you build with Maschine right now?",
    options: ["Complex DAOs", "Static frames with buttons", "Onchain NFT mints"],
    correctAnswer: 1
  },
  {
    question: "What requires external services?",
    options: ["Basic interactions", "User authentication", "Simple quizzes"],
    correctAnswer: 1
  },
  {
    question: "What's NOT supported yet?",
    options: ["Frame buttons", "Database integration", "Image generation"],
    correctAnswer: 2
  }
];

export const RESULT_MESSAGES = [
  "Nice try! Let's review Maschine's limits",
  "Getting there! Check our docs for updates",
  "Expert level! You understand the boundaries"
];
