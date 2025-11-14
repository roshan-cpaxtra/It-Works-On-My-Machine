import { NextResponse } from 'next/server';

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

    // TODO: Add actual authentication logic here
    // Example: Check credentials against database
    // const user = await authenticateUser(email, password);
    // if (!user) {
    //   return NextResponse.json(
    //     { error: 'Invalid email or password.' },
    //     { status: 401 }
    //   );
    // }

    // Replace this with actual authentication logic
    const mockUser = {
      id: '1',
      email: email,
      name: 'User',
      token: 'mock-token',
      role: 'ADMIN',
      permission: [
        {
          id: '',
          resource: 'user',
          permission: 'view'
        },
        {
          id: '',
          resource: 'product',
          permission: 'write'
        }
      ]
    };

    return NextResponse.json(
      {
        success: true,
        user: mockUser,
        token: mockUser.token,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred during login.' },
      { status: 500 }
    );
  }
}

