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
      console.log('📤 Sending login request:', { email });

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('📥 Login response:', data);

      if (!response.ok) {
        console.error('❌ Login failed:', data);
        throw new Error(data.message || data.error || 'Login failed');
      }

      // Use AuthContext to handle login
      console.log('✅ Login successful, processing response...');
      loginWithApiResponse(data);

      // Redirect to dashboard or home page
      console.log('🚀 Redirecting to home page...');
      router.push('/');
    } catch (err) {
      console.error('💥 Login error:', err);
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

