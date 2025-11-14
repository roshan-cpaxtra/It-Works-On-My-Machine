import { NextResponse } from "next/server";
import { users } from "@/app/users/users";

export async function GET() {
  return NextResponse.json(users);
}
