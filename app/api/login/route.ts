import { NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: email, // Backend uses 'username' field
        password: password,
      }),
    });

    const data = await backendResponse.json();

    // If backend returns error, pass it through
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: data.message || 'Login failed',
          success: false,
        },
        { status: backendResponse.status }
      );
    }

    // Return the backend response directly
    // It should match the structure we defined in AuthContext
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        error: 'An error occurred during login. Please try again.',
        success: false,
      },
      { status: 500 }
    );
  }
}

