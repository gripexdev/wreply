"use client";

import { LoaderCircle, TriangleAlert } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast-provider";
import type { RuleListItem } from "@/types/rules";

export function RuleDeleteDialog({
  open,
  rule,
  onClose,
  onCompleted,
}: Readonly<{
  open: boolean;
  rule: RuleListItem | null;
  onClose: () => void;
  onCompleted: () => void;
}>) {
  const { pushToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!rule) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/rules/${rule.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        pushToast({
          variant: "error",
          title: "Unable to delete rule",
          description:
            payload?.message ??
            "This rule could not be deleted right now. Please try again.",
        });
        return;
      }

      pushToast({
        variant: "success",
        title: "Rule deleted successfully",
        description: `"${rule.keyword}" was removed from this workspace.`,
      });
      onCompleted();
      onClose();
    } catch {
      pushToast({
        variant: "error",
        title: "Unable to delete rule",
        description: "Please try again in a moment.",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onClose={() => (isDeleting ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader
          title="Delete rule"
          description="This action permanently removes the rule from the current workspace."
          onClose={() => (isDeleting ? undefined : onClose())}
        />

        <div className="mt-8 rounded-[24px] border border-rose-400/20 bg-rose-500/10 p-5">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/14 text-rose-100">
              <TriangleAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                Delete {rule?.keyword ?? "this rule"}?
              </p>
              <p className="mt-2 text-sm leading-6 text-rose-50/85">
                The reply text, filters, and priority position will be removed.
                This cannot be undone from the interface.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Deleting
              </>
            ) : (
              "Delete rule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
