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
        {
          success: false,
          message: 'Email and password are required',
        },
        { status: 400 }
      );
    }

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users/login`, {
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
    console.log('data',data)

    // If backend returns error, pass it through
    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Login failed',
        },
        { status: backendResponse.status }
      );
    }

    // Return the backend response directly
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login. Please try again.',
      },
      { status: 500 }
    );
  }
}

