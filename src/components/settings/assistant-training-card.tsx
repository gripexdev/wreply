"use client";

import { Bot, Globe, LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { formatShortDate } from "@/lib/utils";
import { updateWorkspaceAssistantSettingsSchema } from "@/lib/validation/assistant-training";
import type {
  WorkspaceAssistantSettingsMutationResponse,
  WorkspaceAssistantSettingsView,
} from "@/types/assistant";

interface AssistantTrainingFormState {
  websiteUrl: string;
  manualKnowledge: string;
}

type AssistantFieldErrors = Partial<
  Record<keyof AssistantTrainingFormState, string>
>;

function buildInitialFormState(
  settings: WorkspaceAssistantSettingsView,
): AssistantTrainingFormState {
  return {
    websiteUrl: settings.websiteUrl,
    manualKnowledge: settings.manualKnowledge,
  };
}

function normalizeFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): AssistantFieldErrors {
  return {
    websiteUrl: fieldErrors?.websiteUrl?.[0],
    manualKnowledge: fieldErrors?.manualKnowledge?.[0],
  };
}

function readResponse<T>(response: Response) {
  return response.json().catch(() => null) as Promise<T | null>;
}

function getStatusBadgeClassName(
  status: WorkspaceAssistantSettingsView["status"],
) {
  switch (status) {
    case "READY":
      return "border-emerald-400/18 bg-emerald-500/10 text-emerald-100";
    case "MISSING_API_KEY":
      return "border-amber-400/18 bg-amber-500/10 text-amber-100";
    case "MISSING_KNOWLEDGE":
    default:
      return "border-white/10 bg-white/[0.04] text-white/72";
  }
}

export function AssistantTrainingCard({
  initialSettings,
}: Readonly<{
  initialSettings: WorkspaceAssistantSettingsView;
}>) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [formState, setFormState] = useState(
    buildInitialFormState(initialSettings),
  );
  const [fieldErrors, setFieldErrors] = useState<AssistantFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof AssistantTrainingFormState>(
    key: K,
    value: AssistantTrainingFormState[K],
  ) {
    setFormState((currentValue) => ({
      ...currentValue,
      [key]: value,
    }));
    setFieldErrors((currentValue) => ({
      ...currentValue,
      [key]: undefined,
    }));
    setFormError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateWorkspaceAssistantSettingsSchema.safeParse(formState);

    if (!parsed.success) {
      setFieldErrors(normalizeFieldErrors(parsed.error.flatten().fieldErrors));
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/settings/assistant", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      const payload = await readResponse<
        WorkspaceAssistantSettingsMutationResponse & {
          message?: string;
          fieldErrors?: Record<string, string[] | undefined>;
        }
      >(response);

      if (!response.ok || !payload) {
        setFieldErrors(normalizeFieldErrors(payload?.fieldErrors));
        setFormError(
          payload?.message ?? "Could not save the assistant details.",
        );
        return;
      }

      setSettings(payload.settings);
      setFormState(buildInitialFormState(payload.settings));
      pushToast({
        variant: "success",
        title: "Assistant updated",
        description: "Your business details are ready to use.",
      });
      router.refresh();
    } catch {
      setFormError("Could not save the assistant details right now.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-white">Train your assistant</CardTitle>
            <CardDescription>Website or business details.</CardDescription>
          </div>
          <Badge className={getStatusBadgeClassName(settings.status)}>
            {settings.statusLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04]">
                <Bot className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground text-[0.68rem] tracking-[0.18em] uppercase">
                  Status
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {settings.statusLabel}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04]">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground text-[0.68rem] tracking-[0.18em] uppercase">
                  Saved details
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {settings.knowledgeCharacterCount} saved
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="text-primary flex h-10 w-10 items-center justify-center rounded-[16px] border border-white/10 bg-white/[0.04]">
                <Globe className="h-4 w-4" />
              </span>
              <div>
                <p className="text-muted-foreground text-[0.68rem] tracking-[0.18em] uppercase">
                  Last update
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {settings.updatedAt
                    ? formatShortDate(settings.updatedAt)
                    : "Not saved"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="assistant-website-url">Website URL</Label>
            <Input
              id="assistant-website-url"
              value={formState.websiteUrl}
              onChange={(event) =>
                updateField("websiteUrl", event.target.value)
              }
              placeholder="https://your-business.ma"
              disabled={isSaving}
            />
            {fieldErrors.websiteUrl ? (
              <p className="text-sm text-rose-300">{fieldErrors.websiteUrl}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="assistant-manual-knowledge">Business info</Label>
            <Textarea
              id="assistant-manual-knowledge"
              value={formState.manualKnowledge}
              onChange={(event) =>
                updateField("manualKnowledge", event.target.value)
              }
              placeholder="Products, services, delivery rules, guarantees, after-sales support, booking rules..."
              className="min-h-36"
              disabled={isSaving}
            />
            {fieldErrors.manualKnowledge ? (
              <p className="text-sm text-rose-300">
                {fieldErrors.manualKnowledge}
              </p>
            ) : null}
          </div>

          {formError ? (
            <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              {formError}
            </div>
          ) : null}

          <div className="flex items-center justify-between gap-4">
            <p className="text-muted-foreground text-sm">
              Add your website or paste your business details.
            </p>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving
                </>
              ) : (
                "Save assistant"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
