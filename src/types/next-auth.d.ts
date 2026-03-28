import type { DefaultSession } from "next-auth";

import type { AppUserRole } from "@/types/auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AppUserRole;
      workspaceId: string | null;
    };
  }

  interface User {
    id: string;
    role: AppUserRole;
    workspaceId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    role?: AppUserRole;
    workspaceId?: string | null;
  }
}
