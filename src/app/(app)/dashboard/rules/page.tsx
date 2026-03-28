import type { Metadata } from "next";

import { RulesPageClient } from "@/components/rules/rules-page-client";
import { rulesQuerySchema } from "@/lib/validation/rules";

export const metadata: Metadata = {
  title: "Rules",
  description:
    "Manage workspace auto-reply rules for common WhatsApp questions.",
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardRulesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const params = await searchParams;
  const parsedFilters = rulesQuerySchema.safeParse({
    search: getSingleValue(params.search),
    status: getSingleValue(params.status),
    language: getSingleValue(params.language),
    matchType: getSingleValue(params.matchType),
    category: getSingleValue(params.category),
  });

  return (
    <RulesPageClient
      initialFilters={
        parsedFilters.success ? parsedFilters.data : rulesQuerySchema.parse({})
      }
    />
  );
}
