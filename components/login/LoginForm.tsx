'use client';

import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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
        onSubmit(email, password);
      }
    } catch {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
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
    </div>
  );
};

