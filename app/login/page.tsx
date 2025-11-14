'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/login/LoginForm';
import { useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { loginWithApiResponse } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Use AuthContext to handle login
      loginWithApiResponse(data);

      // Redirect to dashboard or home page
      router.push('/');
    } catch (err) {
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

