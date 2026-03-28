import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getRequiredSession } from "@/lib/auth";
import { getWorkspaceSummary } from "@/services/workspaces/workspace.service";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getRequiredSession();
  const workspace = session.user.workspaceId
    ? await getWorkspaceSummary(session.user.workspaceId)
    : null;
  const appUser = {
    id: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? "Workspace Owner",
    role: session.user.role,
    workspaceId: session.user.workspaceId,
  };

  return (
    <DashboardShell user={appUser} workspace={workspace}>
      {children}
    </DashboardShell>
  );
}
