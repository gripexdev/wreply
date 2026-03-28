import { NextResponse } from "next/server";

import { AuthServiceError, registerUser } from "@/services/auth/auth.service";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => null);

    if (!payload || typeof payload !== "object") {
      return NextResponse.json(
        { message: "Invalid request body." },
        { status: 400 },
      );
    }

    const result = await registerUser(payload);

    return NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        workspace: result.workspace,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AuthServiceError) {
      const statusCode = error.code === "EMAIL_IN_USE" ? 409 : 400;
      return NextResponse.json(
        { message: error.message },
        { status: statusCode },
      );
    }

    console.error("Registration failed", error);
    return NextResponse.json(
      { message: "Unable to create the account." },
      { status: 500 },
    );
  }
}
