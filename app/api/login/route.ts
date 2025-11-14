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

    if (password !== '1111') {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    // Replace this with actual authentication logic
    // Different users for testing permissions:
    // admin@test.com -> write permission for users
    // user@test.com -> view permission for users (cannot edit)
    const hasWritePermission = email.toLowerCase().includes('admin');

    const mockUser = {
      id: '1',
      email: email,
      name: hasWritePermission ? 'Admin User' : 'Regular User',
      token: 'mock-token',
      role: hasWritePermission ? 'ADMIN' : 'USER',
      permission: [
        {
          id: '',
          resource: 'user',
          permission: hasWritePermission ? 'write' : 'view'
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

