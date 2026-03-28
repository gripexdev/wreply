"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          workspaceName: workspaceName || undefined,
        }),
      });

      const payload = (await response.json().catch(() => null)) as {
        message?: string;
      } | null;

      if (!response.ok) {
        setError(payload?.message ?? "Unable to create your account.");
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (!signInResult || signInResult.error) {
        setError("Account created, but automatic sign in failed.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="name">Your name</Label>
        <Input
          id="name"
          autoComplete="name"
          placeholder="Nadia El Idrissi"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="workspaceName">Workspace name</Label>
        <Input
          id="workspaceName"
          placeholder="Atlas Motors"
          value={workspaceName}
          onChange={(event) => setWorkspaceName(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Work email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="owner@atlasmotors.ma"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>
      {error ? (
        <p className="text-sm font-medium text-rose-300">{error}</p>
      ) : null}
      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? "Creating account..." : "Create account"}
      </Button>
    </form>
  );
}
