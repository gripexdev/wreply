export type AppUserRole = "OWNER" | "ADMIN" | "MEMBER";

export interface AppSessionUser {
  id: string;
  email: string;
  name: string;
  role: AppUserRole;
  workspaceId: string | null;
}
