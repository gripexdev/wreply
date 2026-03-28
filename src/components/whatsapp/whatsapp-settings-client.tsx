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
      label: "Verify token stored",
      complete: connection.verifyTokenConfigured,
    },
    {
      label: "Webhook callback URL ready",
      complete: Boolean(connection.webhookUrl),
    },
    {
      label: "App secret available for signature checks",
      complete: connection.signatureVerificationEnabled,
    },
    {
      label: "Live replies can be attempted",
      complete: connection.canAttemptLiveReplies,
    },
  ];
}

function generateVerifyToken() {
  const bytes = new Uint8Array(18);
  window.crypto.getRandomValues(bytes);

  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
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
      <p className="text-sm text-primary">
        A new {label.toLowerCase()} will replace the stored value on save.
      </p>
    );
  }

  if (!configured) {
    return (
      <p className="text-muted-foreground text-sm">
        No stored {label.toLowerCase()} yet.
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm">
      Stored securely as {preview}. Leave this field blank to keep the current
      value.
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
      description: `${label} is now in your clipboard.`,
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
        setFormError(payload?.message ?? "Unable to save this connection.");
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
        description:
          "Connection settings were updated for this workspace successfully.",
      });
    } catch {
      setFormError("Unable to save this connection right now. Please try again.");
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
                  WhatsApp Cloud API
                </Badge>
                <h1 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                  WhatsApp connection
                </h1>
                <p className="text-muted-foreground mt-3 max-w-2xl text-sm leading-7 sm:text-base">
                  Configure the callback URL, verification token, identifiers,
                  and live reply behavior for the workspace WhatsApp line.
                </p>
              </div>

              <div className="flex flex-col items-start gap-3">
                <WhatsAppStatusBadge status={connection.status} />
                <p className="text-muted-foreground max-w-sm text-sm leading-6">
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
                Recent activity
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-muted-foreground text-xs uppercase">
                    Last webhook
                  </p>
                  <p className="mt-2 text-sm font-semibold text-white">
                    {connection.lastWebhookAt
                      ? formatShortDate(connection.lastWebhookAt)
                      : "No events yet"}
                  </p>
                </div>
                <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-muted-foreground text-xs uppercase">
                    Last verified
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
                  Incoming logs
                </p>
                <p className="font-display mt-2 text-2xl font-semibold text-white">
                  {connection.recentIncomingCount}
                </p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs uppercase">
                  Prepared replies
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
                  {connection.sentOutgoingCount}/{connection.failedOutgoingCount}
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
              <CardDescription>
                Store the identifiers that help WReply map webhook events to the
                correct workspace connection.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="whatsapp-label">Connection label</Label>
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
                <Label htmlFor="whatsapp-phone-number">Display phone number</Label>
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
                <Label htmlFor="whatsapp-phone-number-id">Phone number ID</Label>
                <Input
                  id="whatsapp-phone-number-id"
                  value={formState.phoneNumberId}
                  onChange={(event) =>
                    updateField("phoneNumberId", event.target.value)
                  }
                  placeholder="Enter the Meta phone number ID"
                  disabled={isSaving}
                />
                {fieldErrors.phoneNumberId ? (
                  <p className="text-sm text-rose-300">
                    {fieldErrors.phoneNumberId}
                  </p>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Inbound webhook events are resolved by this value.
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
                  placeholder="Optional but useful for setup tracking"
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
              <CardTitle className="text-white">Webhook credentials</CardTitle>
              <CardDescription>
                Secrets stay on the server. The UI only shows masked previews of
                stored values.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Label htmlFor="whatsapp-verify-token">Verify token</Label>
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
                        handleCopy(formState.verifyToken || null, "Verify token")
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
                  placeholder="Create a strong verification token"
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
                    label="Verify token"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp-access-token">Permanent access token</Label>
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
                <Label htmlFor="whatsapp-app-secret">
                  App secret for signature verification
                </Label>
                <Input
                  id="whatsapp-app-secret"
                  type="password"
                  autoComplete="off"
                  value={formState.appSecret}
                  onChange={(event) => updateField("appSecret", event.target.value)}
                  placeholder="Optional but recommended for X-Hub-Signature-256 validation"
                  disabled={isSaving}
                />
                {fieldErrors.appSecret ? (
                  <p className="text-sm text-rose-300">{fieldErrors.appSecret}</p>
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
              <CardTitle className="text-white">Reply behavior</CardTitle>
              <CardDescription>
                Webhook ingestion always logs inbound events. Live sending only
                happens when this workspace explicitly enables it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Mark webhook subscription complete
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    Use this after Meta webhook verification succeeds from the
                    callback URL and verify token below.
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
                    Enable live auto-reply sending
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    When disabled, WReply still logs the prepared outbound reply
                    honestly as a prepared message instead of pretending it was
                    sent.
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
                    "Save WhatsApp settings"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-white">Webhook endpoint</CardTitle>
              <CardDescription>
                Configure this callback URL and verify token in the Meta app
                webhook settings for the connected business line.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="webhook-url-preview">Callback URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="webhook-url-preview"
                    readOnly
                    value={connection.webhookUrl ?? "Save the connection to generate the webhook URL"}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => handleCopy(connection.webhookUrl, "Webhook URL")}
                    disabled={!connection.webhookUrl}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Verification notes
                </p>
                <ul className="mt-3 space-y-3 text-sm leading-6 text-white/90">
                  <li>The GET verification request must hit this exact callback URL.</li>
                  <li>The verify token must match the stored server value for this workspace connection.</li>
                  <li>Inbound POST requests are resolved again by phone number ID before matching rules.</li>
                </ul>
              </div>

              <div className="rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <p className="text-muted-foreground text-xs tracking-[0.18em] uppercase">
                  Signature checks
                </p>
                <p className="mt-3 text-sm leading-6 text-white/90">
                  {connection.signatureVerificationEnabled
                    ? "X-Hub-Signature-256 validation is active because an app secret is stored."
                    : "Signature verification is currently skipped because no app secret is stored yet."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Setup checklist</CardTitle>
              <CardDescription>
                These checkpoints help the workspace owner know whether the
                connection is ready for inbound processing and live replies.
              </CardDescription>
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
                    <KeyRound className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-white">Operational posture</CardTitle>
              <CardDescription>
                A quick summary of what this workspace can do right now.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
                  <RadioTower className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Webhook ingestion
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {connection.canReceiveWebhooks
                      ? "Ready to receive and process inbound text messages for this connection."
                      : "Missing a phone number ID or verify token, so inbound processing is not ready yet."}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-primary">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Reply delivery mode
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm leading-6">
                    {connection.canAttemptLiveReplies
                      ? "Live send attempts are enabled. Failures are logged honestly if the Meta API rejects the request."
                      : "Replies are currently logged as prepared only, so no external send is attempted."}
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
