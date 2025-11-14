'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
} from '@mui/material';
import { Security as SecurityIcon } from '@mui/icons-material';

interface SecurityQuizProps {
  email: string;
  onPass: () => void;
  onFail: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const quizQuestions: QuizQuestion[] = [
  {
    question: 'Is this account yours?',
    options: ['Yes, it is', 'No, I entered the wrong email'],
    correctAnswer: 0,
    explanation: 'If this is your account, please continue. If not, please check your email address.',
  },
  {
    question: 'Is it safe to share your password?',
    options: ['Yes, it\'s okay with trusted people', 'No, you should never share it'],
    correctAnswer: 1,
    explanation: 'You should never share your password with anyone. This is a fundamental security principle!',
  },
  {
    question: 'What should you do after logging in on a public computer?',
    options: ['Just log out', 'Log out and clear browser history'],
    correctAnswer: 1,
    explanation: 'After using a public computer, you must log out and clear your browser history.',
  },
  {
    question: 'Is it safe to click on suspicious email links?',
    options: ['Yes, it\'s fine', 'No, you should never click them'],
    correctAnswer: 1,
    explanation: 'Suspicious email links could be phishing attacks, so you should never click them.',
  },
];

export const SecurityQuiz: React.FC<SecurityQuizProps> = ({ email, onPass, onFail }) => {
  const [selectedQuestion, setSelectedQuestion] = useState<QuizQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setSelectedQuestion(randomQuestion);
  }, []);

  const handleAnswer = () => {
    if (selectedAnswer === null || !selectedQuestion) return;

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    setShowResult(true);

    if (selectedAnswer === selectedQuestion.correctAnswer) {
      setTimeout(() => {
        onPass();
      }, 1500);
    } else {
      if (newAttempts >= 3) {
        setIsLocked(true);
        setTimeout(() => {
          onFail();
        }, 2000);
      }
    }
  };

  if (isLocked) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <SecurityIcon sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" color="error" gutterBottom>
          Security Verification Failed
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Security verification has failed due to multiple incorrect answers.
          <br />
          Please try again later.
        </Typography>
      </Box>
    );
  }

  if (!selectedQuestion) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ py: 2 }}>
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Security verification is required for the <strong>{email}</strong> account.
          <br />
          Please answer the question below.
        </Typography>
      </Alert>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {selectedQuestion.question}
      </Typography>

      <RadioGroup
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(Number(e.target.value))}
        sx={{ mb: 2 }}
      >
        {selectedQuestion.options.map((option, index) => (
          <FormControlLabel
            key={index}
            value={index}
            control={<Radio />}
            label={option}
            disabled={showResult}
          />
        ))}
      </RadioGroup>

      {showResult && (
        <Alert
          severity={selectedAnswer === selectedQuestion.correctAnswer ? 'success' : 'error'}
          sx={{ mb: 2 }}
        >
          {selectedAnswer === selectedQuestion.correctAnswer ? (
            <Typography variant="body2">✓ Correct! Proceeding...</Typography>
          ) : (
            <Typography variant="body2">
              ✗ Incorrect. {selectedQuestion.explanation}
              <br />
              Remaining attempts: {Math.max(0, 3 - attempts)}
            </Typography>
          )}
        </Alert>
      )}

      {!showResult && (
        <Button
          variant="contained"
          fullWidth
          onClick={handleAnswer}
          disabled={selectedAnswer === null}
          sx={{ mt: 2 }}
        >
          Submit
        </Button>
      )}

      {showResult &&
       selectedAnswer !== selectedQuestion.correctAnswer &&
       attempts < 3 && (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => {
            setShowResult(false);
            setSelectedAnswer(null);
          }}
          sx={{ mt: 2 }}
        >
          Try Again
        </Button>
      )}
    </Box>
  );
};

