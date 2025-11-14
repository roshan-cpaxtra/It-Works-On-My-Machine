import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: Request) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');

    console.log('🔐 [GET /api/users] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

    if (!authHeader) {
      console.error('❌ [GET /api/users] No authorization header provided');
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const size = parseInt(searchParams.get('size') || '10');

    console.log(`📤 [GET /api/users] Proxying to backend: ${BACKEND_API_URL}/v1/users/list (page: ${page}, size: ${size})`);

    // Proxy to real backend API using POST method with body
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users/list`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page,
        size,
      }),
    });

    const data = await backendResponse.json();

    console.log(`📥 [GET /api/users] Backend response status: ${backendResponse.status}`, data.success ? '✅' : '❌');

    // If backend returns error, pass it through
    if (!backendResponse.ok) {
      console.error('❌ [GET /api/users] Backend error:', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to fetch users',
        },
        { status: backendResponse.status }
      );
    }

    // Return the backend response directly
    console.log('✅ [GET /api/users] Returning success response');
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching users',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');

    console.log('🔐 [POST /api/users] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

    if (!authHeader) {
      console.error('❌ [POST /api/users] No authorization header provided');
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    console.log('📤 [POST /api/users] Creating user:', body.username);

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    console.log(`📥 [POST /api/users] Backend response status: ${backendResponse.status}`, data.success ? '✅' : '❌');

    // If backend returns error, pass it through
    if (!backendResponse.ok) {
      console.error('❌ [POST /api/users] Backend error:', data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to create user',
        },
        { status: backendResponse.status }
      );
    }

    // Return the backend response directly
    console.log('✅ [POST /api/users] User created successfully');
    return NextResponse.json(data, { status: 201 });

  } catch (error) {
    console.error('Create user API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while creating user',
      },
      { status: 500 }
    );
  }
}
