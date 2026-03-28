import type { Metadata } from "next";

import { MessageLogsPageClient } from "@/components/messages/message-logs-page-client";
import { messageLogsQuerySchema } from "@/lib/validation/message-logs";

export const metadata: Metadata = {
  title: "Messages",
  description:
    "Inspect inbound customer messages, outbound replies, fallback usage, and send outcomes for the current workspace.",
};

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function DashboardMessagesPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const params = await searchParams;
  const parsedFilters = messageLogsQuerySchema.safeParse({
    search: getSingleValue(params.search),
    direction: getSingleValue(params.direction),
    outcome: getSingleValue(params.outcome),
    sendStatus: getSingleValue(params.sendStatus),
    fallback: getSingleValue(params.fallback),
    dateRange: getSingleValue(params.dateRange),
  });

  return (
    <MessageLogsPageClient
      initialFilters={
        parsedFilters.success
          ? parsedFilters.data
          : messageLogsQuerySchema.parse({})
      }
    />
  );
}
