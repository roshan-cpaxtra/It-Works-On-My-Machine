'use client';

import { LoginForm } from '@/components/login/LoginForm';

export default function LoginPage() {
  const handleLogin = async (email: string, password: string) => {
    // todo: call login api
    // router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

