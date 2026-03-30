import Link from "next/link";
import {
  ArrowRight,
  Bot,
  MessageSquareDashed,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Brand } from "@/components/common/brand";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const featureCards = [
  {
    title: "Message automation",
    description:
      "Rules, fallback behavior, and WhatsApp processing live inside one focused operator workflow.",
    icon: Bot,
  },
  {
    title: "Operational clarity",
    description:
      "Logs, analytics, and connection status help teams see what matched, what failed, and what needs refinement.",
    icon: MessageSquareDashed,
  },
  {
    title: "Trusted by design",
    description:
      "Protected routes, workspace scoping, and honest delivery logging keep the product grounded in real operator trust.",
    icon: ShieldCheck,
  },
];

export default function LandingPage() {
  return (
    <div className="shell-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="panel-sheen flex items-center justify-between rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(11,17,31,0.82),rgba(8,12,21,0.9))] px-5 py-4 shadow-[0_20px_60px_-42px_rgba(0,0,0,0.92)] backdrop-blur-2xl">
          <Brand compact />
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className={buttonStyles({ variant: "ghost" })}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className={buttonStyles()}>
              Start workspace
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-12 lg:py-16">
          <div className="grid w-full items-center gap-10 xl:grid-cols-[1.05fr_0.95fr]">
            <section className="space-y-8">
              <Badge className="border-primary/15 bg-primary/10 text-primary">
                Premium automation workspace
              </Badge>

              <div className="space-y-6">
                <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-[-0.05em] text-white sm:text-6xl xl:text-7xl">
                  WhatsApp automation for Moroccan businesses,
                  <span className="text-gradient">
                    {" "}
                    designed like a real SaaS
                  </span>
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-white/60">
                  WReply gives operators a calmer command center for rules,
                  message activity, WhatsApp setup, fallback behavior, and
                  analytics without the clutter of a generic dashboard template.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/sign-up" className={buttonStyles({ size: "lg" })}>
                  Create workspace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link
                  href="/dashboard"
                  className={buttonStyles({ variant: "secondary", size: "lg" })}
                >
                  Open dashboard
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-white/[0.03]">
                  <CardContent className="p-5">
                    <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                      Coverage
                    </p>
                    <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      Rules + fallback
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.03]">
                  <CardContent className="p-5">
                    <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                      Visibility
                    </p>
                    <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      Logs + analytics
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-white/[0.03]">
                  <CardContent className="p-5">
                    <p className="text-[0.68rem] tracking-[0.22em] text-white/38 uppercase">
                      Channel
                    </p>
                    <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">
                      WhatsApp Cloud
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="surface-glow">
              <Card className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/[0.08] pb-5">
                  <div>
                    <CardTitle className="text-white">
                      Product overview
                    </CardTitle>
                    <CardDescription>
                      A cleaner, darker, more distinctive operator experience.
                    </CardDescription>
                  </div>
                  <Sparkles className="text-primary h-5 w-5" />
                </CardHeader>
                <CardContent className="space-y-4">
                  {featureCards.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5 transition duration-200 hover:border-white/[0.12] hover:bg-white/[0.045]"
                      >
                        <div className="flex items-start gap-4">
                          <span className="border-primary/15 bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-[18px] border">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="space-y-2">
                            <h3 className="font-display text-lg font-semibold tracking-[-0.02em] text-white">
                              {item.title}
                            </h3>
                            <p className="text-sm leading-6 text-white/58">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  <div className="rounded-[24px] border border-dashed border-white/[0.12] bg-white/[0.015] p-5">
                    <p className="text-sm leading-7 text-white/56">
                      The product stays honest about capability. Every visible
                      metric, log, connection state, and fallback outcome is
                      based on real stored data or real runtime behavior.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
