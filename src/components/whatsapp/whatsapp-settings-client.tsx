"use client";

import {
  CheckCircle2,
  Copy,
  KeyRound,
  LoaderCircle,
  RadioTower,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

import { WhatsAppStatusBadge } from "@/components/whatsapp/whatsapp-status-badge";
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
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast-provider";
import { formatShortDate } from "@/lib/utils";
import { updateWhatsAppConnectionSchema } from "@/lib/validation/whatsapp-connection";
import type {
  WhatsAppConnectionMutationResponse,
  WhatsAppConnectionSettingsView,
} from "@/types/whatsapp";

interface ConnectionFormState {
  label: string;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  verifyToken: string;
  accessToken: string;
  appSecret: string;
  webhookSubscribed: boolean;
  sendRepliesEnabled: boolean;
}

type ConnectionFieldErrors = Partial<Record<keyof ConnectionFormState, string>>;

function buildInitialFormState(
  connection: WhatsAppConnectionSettingsView,
): ConnectionFormState {
  return {
    label: connection.label,
    phoneNumber: connection.phoneNumber,
    phoneNumberId: connection.phoneNumberId,
    businessAccountId: connection.businessAccountId,
    verifyToken: "",
    accessToken: "",
    appSecret: "",
    webhookSubscribed: connection.webhookSubscribed,
    sendRepliesEnabled: connection.sendRepliesEnabled,
  };
}

function normalizeFieldErrors(
  fieldErrors?: Record<string, string[] | undefined>,
): ConnectionFieldErrors {
  return {
    label: fieldErrors?.label?.[0],
    phoneNumber: fieldErrors?.phoneNumber?.[0],
    phoneNumberId: fieldErrors?.phoneNumberId?.[0],
    businessAccountId: fieldErrors?.businessAccountId?.[0],
    verifyToken: fieldErrors?.verifyToken?.[0],
    accessToken: fieldErrors?.accessToken?.[0],
    appSecret: fieldErrors?.appSecret?.[0],
    webhookSubscribed: fieldErrors?.webhookSubscribed?.[0],
    sendRepliesEnabled: fieldErrors?.sendRepliesEnabled?.[0],
  };
}

function buildSetupChecklist(connection: WhatsAppConnectionSettingsView) {
  return [
    {
      label: "Phone number ID saved",
      complete: Boolean(connection.phoneNumberId),
    },
    {
      label: "Verification token saved",
      complete: connection.verifyTokenConfigured,
    },
    {
      label: "Message URL ready",
      complete: Boolean(connection.webhookUrl),
    },
    {
      label: "Extra security added",
      complete: connection.signatureVerificationEnabled,
    },
    {
      label: "Live replies ready",
      complete: connection.canAttemptLiveReplies,
    },
  ];
}

function generateVerifyToken() {
  const bytes = new Uint8Array(18);
  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function readResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

function SecretHint({
  configured,
  preview,
  replacementPending,
  label,
}: Readonly<{
  configured: boolean;
  preview: string | null;
  replacementPending: boolean;
  label: string;
}>) {
  if (replacementPending) {
    return (
      <p className="text-primary text-sm">
        A new {label.toLowerCase()} will be saved when you save changes.
      </p>
    );
  }

  if (!configured) {
    return (
      <p className="text-muted-foreground text-sm">
        No saved {label.toLowerCase()} yet.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Saved securely as {preview}. Leave this blank to keep it.
    </p>
  );
}

export function WhatsAppSettingsClient({
  initialConnection,
}: Readonly<{
  initialConnection: WhatsAppConnectionSettingsView;
}>) {
  const { pushToast } = useToast();
  const [connection, setConnection] = useState(initialConnection);
  const [formState, setFormState] = useState<ConnectionFormState>(
    buildInitialFormState(initialConnection),
  );
  const [fieldErrors, setFieldErrors] = useState<ConnectionFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function updateField<K extends keyof ConnectionFormState>(
    key: K,
    value: ConnectionFormState[K],
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

  async function handleCopy(value: string | null, label: string) {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    pushToast({
      variant: "success",
      title: `${label} copied`,
      description: `${label} is ready to paste.`,
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = updateWhatsAppConnectionSchema.safeParse(formState);

    if (!parsed.success) {
      setFieldErrors(normalizeFieldErrors(parsed.error.flatten().fieldErrors));
      setFormError("Please fix the highlighted fields.");
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setFieldErrors({});

    try {
      const response = await fetch("/api/whatsapp/connection", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      const payload = await readResponse<
        WhatsAppConnectionMutationResponse & {
          message?: string;
          fieldErrors?: Record<string, string[] | undefined>;
        }
      >(response);

      if (!response.ok || !payload) {
        setFieldErrors(normalizeFieldErrors(payload?.fieldErrors));
        setFormError(
          payload?.message ?? "Could not save your WhatsApp details.",
        );
        return;
      }

      setConnection(payload.connection);
      setFormState((currentValue) => ({
        ...currentValue,
        accessToken: "",
        appSecret: "",
        webhookSubscribed: payload.connection.webhookSubscribed,
        sendRepliesEnabled: payload.connection.sendRepliesEnabled,
      }));
      pushToast({
        variant: "success",
        title: "WhatsApp settings saved",
        description: "Your WhatsApp details were updated.",
      });
    } catch {
      setFormError("Could not save your WhatsApp details right now.");
    } finally {
      setIsSaving(false);
    }
  }

  const checklist = buildSetupChecklist(connection);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.16fr_0.84fr]">
        <Card className="surface-glow overflow-hidden">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <Badge className="border-primary/20 bg-primary/10 text-primary">
                  WhatsApp
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  WhatsApp setup
                </h1>
                <p className="text-muted-foreground mt-3 text-sm sm:text-base">
                  Connect your number and turn on replies.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3">
                <WhatsAppStatusBadge status={connection.status} />
                <p className="text-muted-foreground max-w-sm text-xs leading-5">
                  {connection.statusDescription}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex h-full flex-col justify-between p-6">
            <div>
              <p className="text-muted-foreground text-xs tracking-[0.22em] uppercase">
                Quick view
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-muted-foreground text-xs uppercase">
                    Last message
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {connection.lastWebhookAt
                      ? formatShortDate(connection.lastWebhookAt)
                      : "No messages yet"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-muted-foreground text-xs uppercase">
                    Last check
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {connection.lastVerifiedAt
                      ? formatShortDate(connection.lastVerifiedAt)
                      : "Not verified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs uppercase">
                  Messages
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">
                  {connection.recentIncomingCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs uppercase">
                  Prepared
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">
                  {connection.preparedOutgoingCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs uppercase">
                  Sent / failed
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">
                  {connection.sentOutgoingCount}/
                  {connection.failedOutgoingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Connection details</CardTitle>
              <CardDescription>Number and account details.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp-label">Line name</Label>
                <Input
                  id="whatsapp-label"
                  value={formState.label}
                  onChange={(event) => updateField("label", event.target.value)}
                  placeholder="Primary showroom line"
                  disabled={isSaving}
                />
                {fieldErrors.label ? (
                  <p className="text-sm text-rose-300">{fieldErrors.label}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone-number">
                  Display phone number
                </Label>
                <Input
                  id="whatsapp-phone-number"
                  value={formState.phoneNumber}
                  onChange={(event) =>
                    updateField("phoneNumber", event.target.value)
                  }
                  placeholder="+212600000000"
                  disabled={isSaving}
                />
                {fieldErrors.phoneNumber ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.phoneNumber}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-phone-number-id">
                  Phone number ID
                </Label>
                <Input
                  id="whatsapp-phone-number-id"
                  value={formState.phoneNumberId}
                  onChange={(event) =>
                    updateField("phoneNumberId", event.target.value)
                  }
                  placeholder="Paste the phone number ID"
                  disabled={isSaving}
                />
                {fieldErrors.phoneNumberId ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.phoneNumberId}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    This links incoming messages to this number.
                  </p>
                )}
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp-business-account-id">
                  Business account ID
                </Label>
                <Input
                  id="whatsapp-business-account-id"
                  value={formState.businessAccountId}
                  onChange={(event) =>
                    updateField("businessAccountId", event.target.value)
                  }
                  placeholder="Optional"
                  disabled={isSaving}
                />
                {fieldErrors.businessAccountId ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.businessAccountId}
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Private details</CardTitle>
              <CardDescription>Stored securely.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label htmlFor="whatsapp-verify-token">
                    Verification token
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        updateField("verifyToken", generateVerifyToken())
                      }
                      disabled={isSaving}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        handleCopy(
                          formState.verifyToken || null,
                          "Verification token",
                        )
                      }
                      disabled={isSaving || !formState.verifyToken}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
                <Input
                  id="whatsapp-verify-token"
                  value={formState.verifyToken}
                  onChange={(event) =>
                    updateField("verifyToken", event.target.value)
                  }
                  placeholder="Create a verification token"
                  disabled={isSaving}
                />
                {fieldErrors.verifyToken ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.verifyToken}
                  </p>
                ) : (
                  <SecretHint
                    configured={connection.verifyTokenConfigured}
                    preview={connection.verifyTokenPreview}
                    replacementPending={Boolean(formState.verifyToken)}
                    label="Verification token"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-access-token">
                  Permanent access token
                </Label>
                <Input
                  id="whatsapp-access-token"
                  type="password"
                  autoComplete="off"
                  value={formState.accessToken}
                  onChange={(event) =>
                    updateField("accessToken", event.target.value)
                  }
                  placeholder="Paste the permanent WhatsApp access token"
                  disabled={isSaving}
                />
                {fieldErrors.accessToken ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.accessToken}
                  </p>
                ) : (
                  <SecretHint
                    configured={connection.accessTokenConfigured}
                    preview={connection.accessTokenPreview}
                    replacementPending={Boolean(formState.accessToken)}
                    label="Access token"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-app-secret">App secret</Label>
                <Input
                  id="whatsapp-app-secret"
                  type="password"
                  autoComplete="off"
                  value={formState.appSecret}
                  onChange={(event) =>
                    updateField("appSecret", event.target.value)
                  }
                  placeholder="Optional"
                  disabled={isSaving}
                />
                {fieldErrors.appSecret ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.appSecret}
                  </p>
                ) : (
                  <SecretHint
                    configured={connection.appSecretConfigured}
                    preview={connection.appSecretPreview}
                    replacementPending={Boolean(formState.appSecret)}
                    label="App secret"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Reply mode</CardTitle>
              <CardDescription>Choose how replies are handled.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Mark Meta setup as complete
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    Turn this on after Meta accepts your URL.
                  </p>
                </div>
                <Switch
                  checked={formState.webhookSubscribed}
                  onCheckedChange={(value) =>
                    updateField("webhookSubscribed", value)
                  }
                  disabled={isSaving}
                  aria-label="Toggle webhook subscribed"
                />
              </div>

              <div className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Send replies automatically
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    When off, replies are saved only.
                  </p>
                </div>
                <Switch
                  checked={formState.sendRepliesEnabled}
                  onCheckedChange={(value) =>
                    updateField("sendRepliesEnabled", value)
                  }
                  disabled={isSaving}
                  aria-label="Toggle live reply sending"
                />
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
                    "Save changes"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Message URL</CardTitle>
              <CardDescription>Use this in Meta.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="webhook-url-preview">Message URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url-preview"
                    readOnly
                    value={
                      connection.webhookUrl ??
                      "Save your details to create the message URL"
                    }
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() =>
                      handleCopy(connection.webhookUrl, "Message URL")
                    }
                    disabled={!connection.webhookUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  In Meta
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-white/90">
                  <li>Paste this exact message URL.</li>
                  <li>Use the saved verification token.</li>
                  <li>Use the phone number ID from this page.</li>
                </ul>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Extra security
                </p>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  {connection.signatureVerificationEnabled
                    ? "Extra security is on because an app secret is saved."
                    : "Add an app secret to turn on extra security."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Setup checklist</CardTitle>
              <CardDescription>What is left to finish.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-[20px] border border-white/10 bg-white/[0.03] px-4 py-3"
                >
                  <span className="text-sm text-white">{item.label}</span>
                  {item.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  ) : (
                    <KeyRound className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Status</CardTitle>
              <CardDescription>Current setup.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <RadioTower className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Receiving messages
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {connection.canReceiveWebhooks
                      ? "Ready to receive messages."
                      : "Add the phone number ID and verification token."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="text-primary flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Sending replies
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs leading-5">
                    {connection.canAttemptLiveReplies
                      ? "Automatic sending is on."
                      : "Replies are saved only."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
