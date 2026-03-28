import Link from "next/link";
import {
  ArrowRight,
  Database,
  LockKeyhole,
  MessageSquareQuote,
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

const foundationCards = [
  {
    title: "Protected workspace shell",
    description:
      "A responsive dashboard layout with route protection and session-aware navigation.",
    icon: LockKeyhole,
  },
  {
    title: "Prisma domain model",
    description:
      "Core entities for workspaces, plans, subscriptions, reply rules, logs, and connections.",
    icon: Database,
  },
  {
    title: "Feature-ready foundation",
    description:
      "Structured for future webhook, billing, rules, and analytics work without pretending they already exist.",
    icon: MessageSquareQuote,
  },
];

export default function LandingPage() {
  return (
    <div className="shell-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-full border border-white/10 bg-black/20 px-5 py-4 backdrop-blur-xl">
          <Brand compact />
          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className={buttonStyles({ variant: "ghost" })}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className={buttonStyles()}>
              Start foundation
            </Link>
          </div>
        </header>

        <main className="flex flex-1 items-center py-12">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="space-y-8">
              <Badge className="border-primary/30 bg-primary/10 text-primary">
                Foundation step
              </Badge>
              <div className="space-y-6">
                <h1 className="font-display max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  WReply is now structured like a real SaaS, not a prototype.
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-8">
                  This foundation ships the architecture, auth base flow,
                  database schema, Docker setup, and dashboard shell for a
                  WhatsApp auto-reply platform focused on Moroccan businesses.
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
                  View protected area
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="bg-black/20">
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                      Languages
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      Darija, FR, AR
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20">
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                      Auth
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      Ready
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-black/20">
                  <CardContent className="p-5">
                    <p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">
                      Database
                    </p>
                    <p className="mt-3 text-2xl font-semibold text-white">
                      Prisma + Postgres
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="surface-glow">
              <Card className="overflow-hidden border-white/10 bg-black/20">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <CardTitle className="text-white">
                      Product foundation board
                    </CardTitle>
                    <CardDescription>
                      What is intentionally live in this step.
                    </CardDescription>
                  </div>
                  <Sparkles className="text-primary h-5 w-5" />
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  {foundationCards.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="hover:border-primary/30 rounded-[24px] border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.05]"
                      >
                        <div className="flex items-start gap-4">
                          <span className="bg-primary/10 text-primary mt-1 flex h-11 w-11 items-center justify-center rounded-2xl">
                            <Icon className="h-5 w-5" />
                          </span>
                          <div className="space-y-2">
                            <h3 className="font-display text-lg font-semibold text-white">
                              {item.title}
                            </h3>
                            <p className="text-muted-foreground text-sm leading-6">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="rounded-[24px] border border-dashed border-white/15 bg-transparent p-5">
                    <p className="text-muted-foreground text-sm leading-6">
                      WhatsApp webhooks, rules CRUD, billing, and analytics are
                      not implemented in this milestone. The architecture is
                      prepared so those features can be added without
                      restructuring the project.
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
