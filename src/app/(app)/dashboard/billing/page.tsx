import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BillingPageClient } from "@/components/billing/billing-page-client";
import { getRequiredSession } from "@/lib/auth";
import { getBillingOverview } from "@/services/billing/billing.service";

export const metadata: Metadata = {
  title: "Billing",
  description: "Manage your plan and billing details.",
};

export default async function DashboardBillingPage() {
  const session = await getRequiredSession();

  if (session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  if (!session.user.workspaceId) {
    redirect("/dashboard");
  }

  const overview = await getBillingOverview(session.user.workspaceId);

  return <BillingPageClient overview={overview} />;
}
