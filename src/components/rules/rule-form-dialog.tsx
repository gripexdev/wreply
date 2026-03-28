"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { ruleLanguageOptions, ruleMatchTypeOptions } from "@/config/rules";
import { createRuleSchema } from "@/lib/validation/rules";
import type {
  RuleLanguage,
  RuleListItem,
  RuleMatchType,
  RuleMutationResponse,
} from "@/types/rules";

type RuleFormMode = "create" | "edit";

interface RuleFormValues {
  keyword: string;
  replyMessage: string;
  matchType: RuleMatchType;
  language: RuleLanguage;
  category: string;
  priority: string;
  isActive: boolean;
}

type RuleFieldErrors = Partial<Record<keyof RuleFormValues, string>>;

function getInitialValues(
  mode: RuleFormMode,
  rule: RuleListItem | null,
  nextPriority: number,
): RuleFormValues {
  if (mode === "edit" && rule) {
    return {
      keyword: rule.keyword,
      replyMessage: rule.replyMessage,
      matchType: rule.matchType,
      language: rule.language,
      category: rule.category ?? "",
      priority: String(rule.priority),
      isActive: rule.isActive,
    };
  }

  return {
    keyword: "",
    replyMessage: "",
    matchType: "CONTAINS",
    language: "ANY",
    category: "",
    priority: String(nextPriority),
    isActive: true,
  };
}

function normalizeFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): RuleFieldErrors {
  return {
    keyword: fieldErrors?.keyword?.[0],
    replyMessage: fieldErrors?.replyMessage?.[0],
    matchType: fieldErrors?.matchType?.[0],
    language: fieldErrors?.language?.[0],
    category: fieldErrors?.category?.[0],
    priority: fieldErrors?.priority?.[0],
    isActive: fieldErrors?.isActive?.[0],
  };
}

export function RuleFormDialog({
  open,
  mode,
  rule,
  nextPriority,
  onClose,
  onCompleted,
}: Readonly<{
  open: boolean;
  mode: RuleFormMode;
  rule: RuleListItem | null;
  nextPriority: number;
  onClose: () => void;
  onCompleted: () => void;
}>) {
  const { pushToast } = useToast();
  const [formValues, setFormValues] = useState<RuleFormValues>(
    getInitialValues(mode, rule, nextPriority),
  );
  const [fieldErrors, setFieldErrors] = useState<RuleFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    setFormValues(getInitialValues(mode, rule, nextPriority));
    setFieldErrors({});
    setFormError(null);
    setIsSubmitting(false);
  }, [mode, nextPriority, open, rule]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = createRuleSchema.safeParse({
      keyword: formValues.keyword,
      replyMessage: formValues.replyMessage,
      matchType: formValues.matchType,
      language: formValues.language,
      category: formValues.category,
      priority: formValues.priority,
      isActive: formValues.isActive,
    });

    if (!parsed.success) {
      const flattenedError = parsed.error.flatten();
      setFieldErrors(normalizeFieldErrors(flattenedError.fieldErrors));
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch(
        mode === "create" ? "/api/rules" : `/api/rules/${rule?.id ?? ""}`,
        {
          method: mode === "create" ? "POST" : "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(parsed.data),
        },
      );

      const payload = (await response.json().catch(() => null)) as
        | (RuleMutationResponse & {
            fieldErrors?: Record<string, string[] | undefined>;
            message?: string;
          })
        | null;

      if (!response.ok) {
        setFieldErrors(normalizeFieldErrors(payload?.fieldErrors));
        setFormError(payload?.message ?? "Unable to save this rule.");
        return;
      }

      pushToast({
        variant: "success",
        title:
          mode === "create"
            ? "Rule created successfully"
            : "Rule updated successfully",
        description:
          mode === "create"
            ? "Your new auto-reply rule is now available in this workspace."
            : "Your changes were saved for this workspace rule.",
      });
      onCompleted();
      onClose();
    } catch {
      setFormError("Unable to save this rule right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField<K extends keyof RuleFormValues>(
    key: K,
    value: RuleFormValues[K],
  ) {
    setFormValues((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
    setFieldErrors((currentValue) => ({
      ...currentValue,
      [key]: undefined,
    }));
  }

  return (
    <Dialog open={open} onClose={() => (isSubmitting ? undefined : onClose())}>
      <DialogContent>
        <DialogHeader
          title={mode === "create" ? "Create a new rule" : "Edit rule"}
          description={
            mode === "create"
              ? "Add a workspace-scoped auto-reply rule for common customer questions."
              : "Update the wording, targeting, or ordering of this auto-reply rule."
          }
          onClose={() => (isSubmitting ? undefined : onClose())}
        />

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rule-keyword">Keyword or phrase</Label>
              <Input
                id="rule-keyword"
                value={formValues.keyword}
                onChange={(event) => updateField("keyword", event.target.value)}
                placeholder="price, prix, taman, delivery..."
                disabled={isSubmitting}
              />
              {fieldErrors.keyword ? (
                <p className="text-sm text-rose-300">{fieldErrors.keyword}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Customers can write in Darija, French, or mixed language.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-category">Category</Label>
              <Input
                id="rule-category"
                value={formValues.category}
                onChange={(event) =>
                  updateField("category", event.target.value)
                }
                placeholder="Sales, logistics, store info"
                disabled={isSubmitting}
              />
              {fieldErrors.category ? (
                <p className="text-sm text-rose-300">{fieldErrors.category}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Optional label for filtering and internal organization.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rule-reply-message">Reply message</Label>
            <Textarea
              id="rule-reply-message"
              value={formValues.replyMessage}
              onChange={(event) =>
                updateField("replyMessage", event.target.value)
              }
              placeholder="Salam 👋 for pricing, please send the product name or photo and we'll reply quickly."
              rows={6}
              disabled={isSubmitting}
            />
            {fieldErrors.replyMessage ? (
              <p className="text-sm text-rose-300">
                {fieldErrors.replyMessage}
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">
                Keep replies clear, business-friendly, and ready to send.
              </p>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="rule-match-type">Match type</Label>
              <Select
                id="rule-match-type"
                value={formValues.matchType}
                onChange={(event) =>
                  updateField(
                    "matchType",
                    event.target.value as RuleFormValues["matchType"],
                  )
                }
                disabled={isSubmitting}
              >
                {ruleMatchTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.matchType ? (
                <p className="text-sm text-rose-300">{fieldErrors.matchType}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-language">Language</Label>
              <Select
                id="rule-language"
                value={formValues.language}
                onChange={(event) =>
                  updateField(
                    "language",
                    event.target.value as RuleFormValues["language"],
                  )
                }
                disabled={isSubmitting}
              >
                {ruleLanguageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              {fieldErrors.language ? (
                <p className="text-sm text-rose-300">{fieldErrors.language}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rule-priority">Priority</Label>
              <Input
                id="rule-priority"
                type="number"
                min={1}
                max={500}
                value={formValues.priority}
                onChange={(event) =>
                  updateField("priority", event.target.value)
                }
                disabled={isSubmitting}
              />
              {fieldErrors.priority ? (
                <p className="text-sm text-rose-300">{fieldErrors.priority}</p>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Lower numbers are evaluated first.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label className="text-base">Rule status</Label>
                <p className="text-muted-foreground mt-1 text-sm">
                  Inactive rules stay saved but are excluded from future
                  matching.
                </p>
              </div>
              <Switch
                aria-label="Toggle rule active state"
                checked={formValues.isActive}
                onCheckedChange={(value) => updateField("isActive", value)}
                disabled={isSubmitting}
                className="shrink-0"
              />
            </div>
          </div>

          {formError ? (
            <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {formError}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : mode === "create" ? (
                "Create rule"
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
