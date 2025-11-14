import { NextResponse } from "next/server";
import { users } from "@/app/users/users";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get user permission from headers
    const userPermission = request.headers.get("x-user-permission");

    // Check if user has write permission for users resource
    if (userPermission !== "write") {
      return NextResponse.json(
        { error: "Forbidden: You don't have permission to update users" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id: userId } = await params;

    console.log("Updating user with ID:", userId);
    console.log("Users array length:", users.length);

    // Find the user to update
    const userIndex = users.findIndex((user) => user.id === userId);

    console.log("Found user at index:", userIndex);

    if (userIndex === -1) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Validate required fields (password is not required for update)
    const requiredFields = [
      "username",
      "email",
      "displayName",
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

    // Check if username or email already exists (excluding current user)
    const existingUser = users.find(
      (user) =>
        user.id !== userId &&
        (user.username === body.username || user.email === body.email)
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "Username or email already exists" },
        { status: 409 }
      );
    }

    // Check if employeeId already exists (excluding current user)
    const existingEmployeeId = users.find(
      (user) => user.id !== userId && user.employeeId === body.employeeId
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

    // Update user object (preserve createdAt and createdBy)
    const updatedUser = {
      ...users[userIndex],
      username: body.username,
      email: body.email,
      displayName: body.displayName,
      employeeId: body.employeeId,
      employeeType: body.employeeType,
      phoneNo: body.phoneNo,
      departmentCode: body.departmentCode,
      departmentName: body.departmentName,
      status: body.status,
      role: body.role,
      updatedAt: now,
      updatedBy: currentUser,
    };

    // Update the user in the array
    users[userIndex] = updatedUser;

    console.log("User updated successfully:", updatedUser.id);
    console.log("Updated user data:", JSON.stringify(updatedUser, null, 2));

    // Return updated user
    return NextResponse.json(
      { message: "User updated successfully", user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
