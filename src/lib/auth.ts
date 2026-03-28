import { redirect } from "next/navigation";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { env } from "@/config/env";
import { verifyUserCredentials } from "@/services/auth/auth.service";
import type { AppUserRole } from "@/types/auth";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await verifyUserCredentials({
          email: credentials.email,
          password: credentials.password,
        });

        if (!user) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          workspaceId: user.workspaceId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = user.role as AppUserRole;
        token.workspaceId = user.workspaceId;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId ?? "";
        session.user.role = (token.role as AppUserRole) ?? "MEMBER";
        session.user.workspaceId = token.workspaceId ?? null;
      }

      return session;
    },
  },
};

export async function getCurrentSession() {
  return getServerSession(authOptions);
}

export async function getRequiredSession() {
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session;
}
