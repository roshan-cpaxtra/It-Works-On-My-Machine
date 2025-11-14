import { NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// GET single user by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to fetch user',
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Get user API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while fetching user',
      },
      { status: 500 }
    );
  }
}

// PUT update user by ID
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    console.log('🔐 [PUT /api/users/:id] Authorization header:', authHeader ? `${authHeader.substring(0, 30)}...` : 'MISSING');

    if (!authHeader) {
      console.error('❌ [PUT /api/users/:id] No authorization header provided');
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();

    console.log(`📤 [PUT /api/users/${id}] Updating user:`, body.username);

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    console.log(`📥 [PUT /api/users/${id}] Backend response status: ${backendResponse.status}`, data.success ? '✅' : '❌');

    if (!backendResponse.ok) {
      console.error(`❌ [PUT /api/users/${id}] Backend error:`, data);
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to update user',
        },
        { status: backendResponse.status }
      );
    }

    console.log(`✅ [PUT /api/users/${id}] User updated successfully`);
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Update user API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while updating user',
      },
      { status: 500 }
    );
  }
}

// DELETE user by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Unauthorized - No token provided',
        },
        { status: 401 }
      );
    }

    const { id } = params;

    // Proxy to real backend API
    const backendResponse = await fetch(`${BACKEND_API_URL}/v1/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to delete user',
        },
        { status: backendResponse.status }
      );
    }

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('Delete user API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred while deleting user',
      },
      { status: 500 }
    );
  }
}
