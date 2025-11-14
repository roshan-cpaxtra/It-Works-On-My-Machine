import { NextResponse } from "next/server";
import { users } from "@/app/users/users";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  try {
    // Get user permission from headers
    const authHeader = request.headers.get("authorization");
    const userPermission = request.headers.get("x-user-permission");

    // Check if user has write permission for users resource
    if (userPermission !== "write") {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to create users" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "username",
      "email",
      "displayName",
      "password",
      "employeeId",
      "employeeType",
      "phoneNo",
      "departmentCode",
      "departmentName",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existingUser = users.find(
      (user) => user.username === body.username || user.email === body.email
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Check if employeeId already exists
    const existingEmployeeId = users.find(
      (user) => user.employeeId === body.employeeId
    );

    if (existingEmployeeId) {
      return NextResponse.json(
        { error: "Employee ID already exists" },
        { status: 409 }
      );
    }

    // Get current user info from header for audit fields
    const currentUser = request.headers.get("x-user-email") || "system";
    const now = new Date().toISOString().slice(0, 16); // Format: "2025-11-14T12:30"

    // Create new user object
    const newUser = {
      id: uuidv4(),
      username: body.username,
      email: body.email,
      displayName: body.displayName,
      employeeId: body.employeeId,
      employeeType: body.employeeType,
      phoneNo: body.phoneNo,
      departmentCode: body.departmentCode,
      departmentName: body.departmentName,
      status: body.status || "ACTIVE",
      role: body.role || "Specialist",
      createdAt: now,
      createdBy: currentUser,
      updatedAt: now,
      updatedBy: currentUser,
    };

    // Add new user to the array
    users.push(newUser);

    // Return created user (without password)
    return NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
