"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { RulesPagination as RulesPaginationState } from "@/types/rules";

export function RulesPagination({
  pagination,
  onPageChange,
}: Readonly<{
  pagination: RulesPaginationState;
  onPageChange: (page: number) => void;
}>) {
  if (pagination.totalItems === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-medium text-white">
          {pagination.startItem}-{pagination.endItem} of {pagination.totalItems}
        </p>
        <p className="text-xs text-white/42">
          Page {pagination.page} of {pagination.totalPages}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="default"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="default"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
