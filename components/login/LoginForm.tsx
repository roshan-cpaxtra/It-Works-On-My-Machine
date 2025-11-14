'use client';

import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Modal } from '@/components/common/Modal';
import { SecurityQuiz } from './SecurityQuiz';

interface LoginFormProps {
  onSubmit?: (email: string, password: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failureCount, setFailureCount] = useState(0);
  const [showSecurityQuiz, setShowSecurityQuiz] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setPasswordError('');
    setError('');
    setLoading(true);

    let hasError = false;

    if (!email) {
      setEmailError('Email is required.');
      hasError = true;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password) {
      setPasswordError('Password is required.');
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      if (onSubmit) {
        await onSubmit(email, password);
        setFailureCount(0);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(errorMessage);

      // 실패 횟수 증가
      const newFailureCount = failureCount + 1;
      setFailureCount(newFailureCount);

      // 3번째 실패 시 보안 퀴즈 표시
      if (newFailureCount >= 3) {
        setShowSecurityQuiz(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizPass = () => {
    setShowSecurityQuiz(false);
    setFailureCount(0);
    setError('');
  };

  const handleQuizFail = () => {
    setShowSecurityQuiz(false);
    setError('Security Verification Failed. Please retry again.');
    setFailureCount(0);
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="max-w-xs mx-auto">
      <div className="mt-16 flex flex-col items-center">
        <div className="shadow-lg p-8 flex flex-col items-center w-full rounded-lg bg-white">
          <h1 className="text-3xl font-medium mb-4">
            Login
          </h1>
          <p className="text-sm text-gray-600 mb-6">
            Sign in to your account
          </p>

          {error && (
            <div className="w-full mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-2 w-full">
            <div className="mb-4">
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                disabled={loading}
                className="w-full"
                error={!!emailError}
                helperText={emailError}
              />
            </div>
            <div className="mb-4">
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError('');
                }}
                disabled={loading}
                className="w-full"
                error={!!passwordError}
                helperText={passwordError}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={handleTogglePasswordVisibility}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>,
                  },
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-6 mb-4 py-3 px-4 text-white font-medium rounded transition-colors cursor-pointer ${
                loading
                  ? 'bg-[#9ca3af] cursor-not-allowed'
                  : 'bg-[#667eea] hover:bg-[#764ba2]'
              }`}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>

      <Modal
        open={showSecurityQuiz}
        onClose={() => {}}
        type="warn"
        title="Security verification"
        content={<SecurityQuiz email={email} onPass={handleQuizPass} onFail={handleQuizFail} />}
        confirmText=""
        showButtons={false}
        disableBackdropClick={true}
      />
    </div>
  );
};

