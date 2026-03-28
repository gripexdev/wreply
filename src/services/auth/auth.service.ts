import { UserRole } from "@prisma/client";
import { compare, hash } from "bcryptjs";

import { prisma } from "@/database/client";
import {
  signInSchema,
  signUpSchema,
  type SignInInput,
  type SignUpInput,
} from "@/lib/validation/auth";
import { provisionWorkspaceForUser } from "@/services/workspaces/workspace.service";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  workspaceId: string | null;
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: "EMAIL_IN_USE" | "INVALID_INPUT",
  ) {
    super(message);
    this.name = "AuthServiceError";
  }
}

export async function verifyUserCredentials(
  input: SignInInput,
): Promise<AuthenticatedUser | null> {
  const parsedInput = signInSchema.safeParse(input);

  if (!parsedInput.success) {
    return null;
  }

  const email = parsedInput.data.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      role: true,
      workspaceId: true,
    },
  });

  if (!user) {
    return null;
  }

  const passwordMatches = await compare(
    parsedInput.data.password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    workspaceId: user.workspaceId,
  };
}

export async function registerUser(input: SignUpInput) {
  const parsedInput = signUpSchema.safeParse(input);

  if (!parsedInput.success) {
    throw new AuthServiceError(
      "Please provide valid account details.",
      "INVALID_INPUT",
    );
  }

  const email = parsedInput.data.email.toLowerCase();
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AuthServiceError(
      "An account already exists for this email.",
      "EMAIL_IN_USE",
    );
  }

  const passwordHash = await hash(parsedInput.data.password, 12);

  return prisma.$transaction(async (transaction) => {
    const user = await transaction.user.create({
      data: {
        email,
        name: parsedInput.data.name.trim(),
        passwordHash,
        role: UserRole.OWNER,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    const workspace = await provisionWorkspaceForUser(transaction, {
      ownerId: user.id,
      ownerName: user.name,
      workspaceName: parsedInput.data.workspaceName,
    });

    return {
      user: {
        ...user,
        workspaceId: workspace.id,
      },
      workspace,
    };
  });
}
