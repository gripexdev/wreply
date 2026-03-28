"use client";

import { Building2, Clock3, LoaderCircle, MapPin, Sparkles } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { formatShortDate } from "@/lib/utils";
import { updateWorkspaceBusinessSettingsSchema } from "@/lib/validation/workspace-settings";
import type {
  WorkspaceBusinessSettingsMutationResponse,
  WorkspaceBusinessSettingsView,
} from "@/types/settings";

interface BusinessSettingsFormState {
  businessName: string;
  replyDisplayName: string;
  businessPhoneNumber: string;
  address: string;
  googleMapsLink: string;
  workingHours: string;
  languagePreference: WorkspaceBusinessSettingsView["languagePreference"];
  fallbackReplyEnabled: boolean;
  fallbackReplyMessage: string;
}

type BusinessFieldErrors = Partial<
  Record<keyof BusinessSettingsFormState, string>
>;

function buildInitialFormState(
  settings: WorkspaceBusinessSettingsView,
): BusinessSettingsFormState {
  return {
    businessName: settings.businessName,
    replyDisplayName: settings.replyDisplayName,
    businessPhoneNumber: settings.businessPhoneNumber,
    address: settings.address,
    googleMapsLink: settings.googleMapsLink,
    workingHours: settings.workingHours,
    languagePreference: settings.languagePreference,
    fallbackReplyEnabled: settings.fallbackReplyEnabled,
    fallbackReplyMessage: settings.fallbackReplyMessage,
  };
}

function normalizeFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): BusinessFieldErrors {
  return {
    businessName: fieldErrors?.businessName?.[0],
    replyDisplayName: fieldErrors?.replyDisplayName?.[0],
    businessPhoneNumber: fieldErrors?.businessPhoneNumber?.[0],
    address: fieldErrors?.address?.[0],
    googleMapsLink: fieldErrors?.googleMapsLink?.[0],
    workingHours: fieldErrors?.workingHours?.[0],
    languagePreference: fieldErrors?.languagePreference?.[0],
    fallbackReplyEnabled: fieldErrors?.fallbackReplyEnabled?.[0],
    fallbackReplyMessage: fieldErrors?.fallbackReplyMessage?.[0],
  };
}

function readResponse<T>(response: Response) {
  return response.json().catch(() => null) as Promise<T | null>;
}

function StatusCard({
  title,
  value,
  description,
  icon: Icon,
}: Readonly<{
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}>) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
            {title}
          </p>
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <p className="font-display mt-4 text-3xl font-semibold text-white">
          {value}
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function BusinessSettingsClient({
  initialSettings,
}: Readonly<{
  initialSettings: WorkspaceBusinessSettingsView;
}>) {
  const router = useRouter();
  const { pushToast } = useToast();
  const [settings, setSettings] = useState(initialSettings);
  const [formState, setFormState] = useState(
    buildInitialFormState(initialSettings),
  );
  const [fieldErrors, setFieldErrors] = useState<BusinessFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof BusinessSettingsFormState>(
    key: K,
    value: BusinessSettingsFormState[K],
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

    const parsed = updateWorkspaceBusinessSettingsSchema.safeParse(formState);

    if (!parsed.success) {
      setFieldErrors(normalizeFieldErrors(parsed.error.flatten().fieldErrors));
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/settings/workspace", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      const payload = await readResponse<
        WorkspaceBusinessSettingsMutationResponse & {
          message?: string;
          fieldErrors?: Record<string, string[] | undefined>;
        }
      >(response);

      if (!response.ok || !payload) {
        setFieldErrors(normalizeFieldErrors(payload?.fieldErrors));
        setFormError(payload?.message ?? "Unable to save business settings.");
        return;
      }

      setSettings(payload.settings);
      setFormState(buildInitialFormState(payload.settings));
      pushToast({
        variant: "success",
        title: "Business settings saved",
        description:
          "Workspace identity and fallback reply settings were updated successfully.",
      });
      router.refresh();
    } catch {
      setFormError("Unable to save business settings right now. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const profileSignals = [
    Boolean(settings.businessPhoneNumber),
    Boolean(settings.address),
    Boolean(settings.googleMapsLink),
    Boolean(settings.workingHours),
    Boolean(settings.replyDisplayName),
  ];
  const profileCompletion = Math.round(
    (profileSignals.filter(Boolean).length / profileSignals.length) * 100,
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  Workspace settings
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  Business settings
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                  Define the business identity operators should see across the
                  product and configure the fallback reply used when no rule
                  matches an incoming customer message.
                </p>
              </div>

              <div className="rounded-[24px] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/90">
                Updated {formatShortDate(settings.updatedAt)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                Reply posture
              </p>
              <p className="mt-4 text-sm leading-7 text-white/90">
                Keep fallback messaging clear and honest so customers receive a
                calm acknowledgment even when no rule applies yet.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                {settings.languagePreference.toLowerCase()}
              </Badge>
              <Badge className="border-white/10 bg-white/[0.03] text-white">
                {settings.fallbackReplyEnabled
                  ? "fallback enabled"
                  : "fallback disabled"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatusCard
          title="Business profile"
          value={`${profileCompletion}%`}
          description="How complete the key workspace identity fields are right now."
          icon={Building2}
        />
        <StatusCard
          title="Fallback mode"
          value={settings.fallbackReplyEnabled ? "Enabled" : "Disabled"}
          description="Unmatched customer messages can use the workspace fallback reply when this is on."
          icon={Sparkles}
        />
        <StatusCard
          title="Working hours"
          value={settings.workingHours || "Not set"}
          description="Used by operators as a reliable at-a-glance reference."
          icon={Clock3}
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Business identity</CardTitle>
              <CardDescription>
                These fields shape the operator-facing profile for the current
                workspace and can be reused in future reply templates.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business-name">Business name</Label>
                <Input
                  id="business-name"
                  value={formState.businessName}
                  onChange={(event) =>
                    updateField("businessName", event.target.value)
                  }
                  placeholder="Atlas Motors"
                  disabled={isSaving}
                />
                <p className="text-muted-foreground text-sm">
                  This is the primary workspace name shown across the dashboard.
                </p>
                {fieldErrors.businessName ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.businessName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-display-name">Reply display name</Label>
                <Input
                  id="reply-display-name"
                  value={formState.replyDisplayName}
                  onChange={(event) =>
                    updateField("replyDisplayName", event.target.value)
                  }
                  placeholder="Atlas Motors team"
                  disabled={isSaving}
                />
                <p className="text-muted-foreground text-sm">
                  A friendly name you want operators to use in customer-facing replies.
                </p>
                {fieldErrors.replyDisplayName ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.replyDisplayName}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-language">Default language preference</Label>
                <Select
                  id="business-language"
                  value={formState.languagePreference}
                  onChange={(event) =>
                    updateField(
                      "languagePreference",
                      event.target
                        .value as BusinessSettingsFormState["languagePreference"],
                    )
                  }
                  disabled={isSaving}
                >
                  <option value="ANY">Any</option>
                  <option value="DARIJA">Darija</option>
                  <option value="FRENCH">French</option>
                </Select>
                <p className="text-muted-foreground text-sm">
                  A workspace default for future reply experiences and operator context.
                </p>
                {fieldErrors.languagePreference ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.languagePreference}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Contact references</CardTitle>
              <CardDescription>
                Keep the business contact details easy to reuse for future auto-replies,
                operator handoffs, and location answers.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="business-phone-number">Contact phone number</Label>
                <Input
                  id="business-phone-number"
                  value={formState.businessPhoneNumber}
                  onChange={(event) =>
                    updateField("businessPhoneNumber", event.target.value)
                  }
                  placeholder="+212600000000"
                  disabled={isSaving}
                />
                {fieldErrors.businessPhoneNumber ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.businessPhoneNumber}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="business-working-hours">Working hours</Label>
                <Input
                  id="business-working-hours"
                  value={formState.workingHours}
                  onChange={(event) =>
                    updateField("workingHours", event.target.value)
                  }
                  placeholder="Monday to Saturday, 9:00 to 19:00"
                  disabled={isSaving}
                />
                {fieldErrors.workingHours ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.workingHours}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="business-address">Address</Label>
                <Textarea
                  id="business-address"
                  value={formState.address}
                  onChange={(event) => updateField("address", event.target.value)}
                  placeholder="201 Boulevard Ghandi, Casablanca"
                  disabled={isSaving}
                  className="min-h-24"
                />
                <p className="text-muted-foreground text-sm">
                  Useful for future rule replies about location, delivery zones, or in-store pickup.
                </p>
                {fieldErrors.address ? (
                  <p className="text-sm text-rose-300">{fieldErrors.address}</p>
                ) : null}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="google-maps-link">Google Maps link</Label>
                <Input
                  id="google-maps-link"
                  value={formState.googleMapsLink}
                  onChange={(event) =>
                    updateField("googleMapsLink", event.target.value)
                  }
                  placeholder="https://maps.google.com/?q=..."
                  disabled={isSaving}
                />
                <p className="text-muted-foreground text-sm">
                  Paste the exact map URL customers should receive.
                </p>
                {fieldErrors.googleMapsLink ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.googleMapsLink}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Fallback reply</CardTitle>
              <CardDescription>
                Decide what WReply should do when an inbound message does not
                match any active rule yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Enable unmatched fallback reply
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    When enabled, unmatched inbound messages will create a fallback
                    outbound reply candidate using the message below.
                  </p>
                </div>
                <Switch
                  checked={formState.fallbackReplyEnabled}
                  onCheckedChange={(value) =>
                    updateField("fallbackReplyEnabled", value)
                  }
                  disabled={isSaving}
                  aria-label="Toggle fallback reply"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fallback-reply-message">Fallback reply message</Label>
                <Textarea
                  id="fallback-reply-message"
                  value={formState.fallbackReplyMessage}
                  onChange={(event) =>
                    updateField("fallbackReplyMessage", event.target.value)
                  }
                  placeholder="Salam 👋 thanks for your message. We’ll reply as soon as possible."
                  disabled={isSaving}
                />
                <p className="text-muted-foreground text-sm">
                  Keep this short, reassuring, and honest. It should confirm receipt without pretending a full answer already exists.
                </p>
                {fieldErrors.fallbackReplyMessage ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.fallbackReplyMessage}
                  </p>
                ) : null}
              </div>

              {formError ? (
                <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                  {formError}
                </div>
              ) : null}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Saving
                    </>
                  ) : (
                    "Save business settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Operator-ready snapshot</CardTitle>
              <CardDescription>
                A quick operational summary of the business profile currently stored for this workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <Building2 className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {settings.businessName}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {settings.replyDisplayName || "No reply display name yet"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    {settings.address || "Address not set"}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {settings.googleMapsLink
                      ? "Google Maps link is ready to reuse."
                      : "Google Maps link has not been added yet."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Fallback preview</CardTitle>
              <CardDescription>
                This is what unmatched-message behavior currently looks like from an operator perspective.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Status
                </p>
                <p className="mt-3 text-sm font-semibold text-white">
                  {settings.fallbackReplyEnabled
                    ? "Fallback replies are active for unmatched messages."
                    : "Fallback replies are disabled for unmatched messages."}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Current message
                </p>
                <p className="mt-3 text-sm leading-7 text-white/90">
                  {settings.fallbackReplyMessage ||
                    "No fallback reply has been configured yet."}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
