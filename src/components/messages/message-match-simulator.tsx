"use client";

import { LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";

import { MatchResultCard } from "@/components/messages/match-result-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast-provider";
import { messageTestExamples } from "@/config/messages";
import { testMessageSchema } from "@/lib/validation/message-test";
import type { TestMessageMatchResponse } from "@/types/messages";

async function readResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}

export function MessageMatchSimulator() {
  const { pushToast } = useToast();
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<
    TestMessageMatchResponse["result"] | null
  >(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsed = testMessageSchema.safeParse({
      message,
    });

    if (!parsed.success) {
      const nextFieldError = parsed.error.flatten().fieldErrors.message?.[0];
      setFieldError(nextFieldError ?? "A valid message is required.");
      setFormError("Please fix the highlighted field.");
      return;
    }

    setIsSubmitting(true);
    setFieldError(null);
    setFormError(null);

    try {
      const response = await fetch("/api/rules/test-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });
      const payload = await readResponse<
        TestMessageMatchResponse & {
          message?: string;
          fieldErrors?: Record<string, string[] | undefined>;
        }
      >(response);

      if (!response.ok || !payload) {
        const nextFieldError = payload?.fieldErrors?.message?.[0] ?? null;
        setFieldError(nextFieldError);
        setFormError(payload?.message ?? "Could not test this message.");
        return;
      }

      setResult(payload.result);
      pushToast({
        variant: payload.result.matched ? "success" : "info",
        title: payload.result.matched ? "Reply found" : "No reply found",
        description: payload.result.matched
          ? `Matched "${payload.result.matchedRule?.keyword ?? "rule"}".`
          : "No saved reply matched this message.",
      });
    } catch {
      setFormError("Could not test this message right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-white">Try a message</CardTitle>
              <CardDescription>
                Preview how WReply will respond.
              </CardDescription>
            </div>
            <Badge className="border-primary/20 bg-primary/10 text-primary">
              Preview
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="message-test-input">Customer message</Label>
              <Textarea
                id="message-test-input"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setFieldError(null);
                  setFormError(null);
                }}
                placeholder="Type a sample WhatsApp message such as prix, chhal taman, fin kayn, or horaire svp..."
                disabled={isSubmitting}
                rows={8}
              />
              {fieldError ? (
                <p className="text-sm text-rose-300">{fieldError}</p>
              ) : (
                <p className="text-muted-foreground text-sm leading-6">
                  We clean the message first so short and messy text still
                  matches well.
                </p>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                Try one
              </p>
              <div className="flex flex-wrap gap-2">
                {messageTestExamples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    className="hover:border-primary/40 hover:bg-primary/10 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white transition"
                    onClick={() => {
                      setMessage(example);
                      setFieldError(null);
                      setFormError(null);
                    }}
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            {formError ? (
              <div className="rounded-[20px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {formError}
              </div>
            ) : null}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-muted-foreground text-sm">
                This preview does not send anything.
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Checking
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Check reply
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <MatchResultCard result={result} />
    </div>
  );
}
