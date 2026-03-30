import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  Bot,
  CheckCheck,
  MessageCircleReply,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Workflow,
} from "lucide-react";

import { Brand } from "@/components/common/brand";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    step: "01",
    title: "Create your reply rules",
    description:
      "Set triggers like prix, stock, livraison, horaires, or any phrase your customers repeat every day.",
  },
  {
    step: "02",
    title: "Connect your WhatsApp number",
    description:
      "WReply listens for incoming messages, checks your rules, and keeps everything tied to your workspace.",
  },
  {
    step: "03",
    title: "Answer instantly with visibility",
    description:
      "Customers get fast replies and your team can inspect matches, fallbacks, and delivery status in one place.",
  },
] as const;

const useCases = [
  {
    title: "Shops",
    description:
      "Answer price, stock, delivery, and location questions automatically.",
    icon: ShoppingBag,
  },
  {
    title: "Salons",
    description:
      "Handle hours, address, booking questions, and service availability faster.",
    icon: Scissors,
  },
  {
    title: "Local brands",
    description:
      "Keep WhatsApp responsive even when orders and customer questions spike.",
    icon: Store,
  },
] as const;

const proofPoints = [
  "Built for Darija, French, and mixed WhatsApp messages.",
  "Rules, fallback replies, logs, and analytics live in one workspace.",
  "Every automated decision stays visible instead of disappearing into a black box.",
] as const;

function UseCaseCard({
  title,
  description,
  icon: Icon,
}: Readonly<{
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}>) {
  return (
    <Card className="bg-white/[0.03]">
      <CardContent className="p-5">
        <span className="text-primary flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="font-display mt-5 text-xl font-semibold tracking-[-0.03em] text-white">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/62">{description}</p>
      </CardContent>
    </Card>
  );
}

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
              Try it free
            </Link>
          </div>
        </header>

        <main className="flex-1 py-10 sm:py-12 lg:py-14">
          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            <section className="grid items-center gap-8 xl:grid-cols-[1.02fr_0.98fr]">
              <div className="space-y-7">
                <Badge className="border-primary/15 bg-primary/10 text-primary">
                  WhatsApp automation for Moroccan businesses
                </Badge>

                <div className="space-y-5">
                  <h1 className="font-display max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-white sm:text-6xl xl:text-7xl">
                    Reply to WhatsApp customers instantly
                    <span className="text-gradient"> without typing.</span>
                  </h1>
                  <p className="max-w-2xl text-lg leading-8 text-white/66">
                    WReply watches incoming messages, matches the right rule,
                    sends the right reply, and shows exactly what happened, so
                    your business stays responsive even when your team is busy.
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/sign-up"
                    className={buttonStyles({ size: "lg" })}
                  >
                    Start automating replies
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                  <Link
                    href="/sign-in"
                    className={buttonStyles({
                      variant: "secondary",
                      size: "lg",
                    })}
                  >
                    Open product
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">
                      Faster replies
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/78">
                      Handle repetitive questions automatically.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">
                      Real visibility
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/78">
                      See matches, fallbacks, sends, and failures.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
                    <p className="text-[0.68rem] tracking-[0.2em] text-white/40 uppercase">
                      Built for WhatsApp
                    </p>
                    <p className="mt-3 text-sm leading-6 text-white/78">
                      Designed for real customer conversations, not generic
                      chatbots.
                    </p>
                  </div>
                </div>
              </div>

              <div className="surface-glow">
                <Card className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="border-b border-white/[0.08] bg-[radial-gradient(circle_at_top_left,rgba(68,216,180,0.18),transparent_52%)] p-5 sm:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
                            Live reply flow
                          </p>
                          <h2 className="font-display mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">
                            From customer question to automatic reply
                          </h2>
                        </div>
                        <Badge className="border-emerald-400/18 bg-emerald-500/10 text-emerald-100">
                          System ready
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-5 p-5 sm:p-6">
                      <div className="grid gap-4 lg:grid-cols-[0.95fr_0.28fr_1.05fr]">
                        <div className="rounded-[26px] border border-sky-400/18 bg-[linear-gradient(180deg,rgba(18,40,68,0.74),rgba(10,19,34,0.94))] p-5">
                          <p className="text-[0.68rem] tracking-[0.2em] text-sky-100/70 uppercase">
                            Incoming WhatsApp
                          </p>
                          <p className="mt-4 text-sm leading-7 text-sky-50">
                            “Salam, prix dyal had produit ?”
                          </p>
                        </div>

                        <div className="flex items-center justify-center">
                          <div className="text-primary flex h-14 w-14 items-center justify-center rounded-[20px] border border-white/[0.08] bg-white/[0.03]">
                            <Workflow className="h-5 w-5" />
                          </div>
                        </div>

                        <div className="rounded-[26px] border border-emerald-400/18 bg-[linear-gradient(180deg,rgba(18,60,56,0.74),rgba(10,23,25,0.96))] p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="border-white/[0.08] bg-black/20 text-white/74">
                              matched rule: price
                            </Badge>
                            <Badge className="border-white/[0.08] bg-black/20 text-white/74">
                              contains
                            </Badge>
                          </div>
                          <p className="mt-4 text-sm leading-7 text-emerald-50">
                            “Salam 👋 for pricing, send the product name or
                            photo and we’ll reply quickly.”
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <p className="text-[0.68rem] tracking-[0.18em] text-white/40 uppercase">
                            Rule engine
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/78">
                            Exact and contains matching for real customer
                            phrasing.
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <p className="text-[0.68rem] tracking-[0.18em] text-white/40 uppercase">
                            Visibility
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/78">
                            Every inbound and outbound event is logged.
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <p className="text-[0.68rem] tracking-[0.18em] text-white/40 uppercase">
                            Operator trust
                          </p>
                          <p className="mt-2 text-sm leading-6 text-white/78">
                            Clear fallback behavior and honest delivery status.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(29,14,20,0.62),rgba(10,12,22,0.96))]">
                <CardContent className="p-6 sm:p-7">
                  <p className="text-[0.68rem] tracking-[0.22em] text-rose-100/46 uppercase">
                    The problem
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    WhatsApp gets repetitive fast.
                  </h2>
                  <div className="mt-5 space-y-3">
                    <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/74">
                      Customers keep asking the same things: price, stock,
                      delivery, address, hours.
                    </div>
                    <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/74">
                      Teams answer late when they are busy on the floor, in the
                      salon, or handling orders.
                    </div>
                    <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4 text-sm leading-6 text-white/74">
                      Most tools either feel like a chatbot toy or hide what
                      actually happened.
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(9,29,31,0.76),rgba(8,12,22,0.96))]">
                <CardContent className="p-6 sm:p-7">
                  <p className="text-[0.68rem] tracking-[0.22em] text-emerald-100/46 uppercase">
                    The solution
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    WReply turns repeated questions into instant answers.
                  </h2>
                  <div className="mt-5 space-y-3">
                    {proofPoints.map((item) => (
                      <div
                        key={item}
                        className="flex items-start gap-3 rounded-[22px] border border-white/[0.08] bg-black/18 p-4"
                      >
                        <span className="text-primary mt-0.5">
                          <CheckCheck className="h-4 w-4" />
                        </span>
                        <p className="text-sm leading-6 text-white/78">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Card>
                <CardContent className="p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
                        How it works
                      </p>
                      <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                        Three steps to a faster WhatsApp workflow
                      </h2>
                    </div>
                    <span className="text-primary flex h-12 w-12 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
                      <Bot className="h-5 w-5" />
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    {steps.map((item) => (
                      <div
                        key={item.step}
                        className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-5"
                      >
                        <p className="text-primary text-sm font-semibold">
                          {item.step}
                        </p>
                        <h3 className="font-display mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                          {item.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-white/62">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 sm:p-7">
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
                    Why it feels real
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    A product operators can actually trust
                  </h2>
                  <div className="mt-6 space-y-3">
                    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="text-primary mt-0.5 h-4 w-4" />
                        <p className="text-sm leading-6 text-white/76">
                          Rules and fallback behavior stay explicit instead of
                          hidden behind vague automation promises.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="text-primary mt-0.5 h-4 w-4" />
                        <p className="text-sm leading-6 text-white/76">
                          Logs and analytics make it easy to inspect what
                          matched, what failed, and what needs improvement.
                        </p>
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                      <div className="flex items-start gap-3">
                        <MessageCircleReply className="text-primary mt-0.5 h-4 w-4" />
                        <p className="text-sm leading-6 text-white/76">
                          Built specifically for the pace and phrasing of
                          WhatsApp conversations, not generic support queues.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[0.68rem] tracking-[0.22em] text-white/40 uppercase">
                    Use cases
                  </p>
                  <h2 className="font-display mt-3 text-2xl font-semibold tracking-[-0.04em] text-white">
                    Built for teams that sell and answer fast on WhatsApp
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-7 text-white/58">
                  Ideal for businesses that get the same pre-sale questions
                  every day and need a better first response.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {useCases.map((item) => (
                  <UseCaseCard
                    key={item.title}
                    title={item.title}
                    description={item.description}
                    icon={item.icon}
                  />
                ))}
              </div>
            </section>

            <section>
              <Card className="surface-glow overflow-hidden">
                <CardContent className="relative p-6 sm:p-8 lg:p-10">
                  <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(68,216,180,0.18),transparent_64%)]" />
                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-2xl space-y-4">
                      <Badge className="border-primary/15 bg-primary/10 text-primary">
                        Start with your most repeated questions
                      </Badge>
                      <h2 className="font-display text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                        Stop typing the same WhatsApp replies every day.
                      </h2>
                      <p className="text-sm leading-7 text-white/66 sm:text-base">
                        Set up your first rules, connect your number, and let
                        WReply handle the repetitive questions while your team
                        focuses on real conversations.
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      <Link
                        href="/sign-up"
                        className={buttonStyles({ size: "lg" })}
                      >
                        Start automating replies
                      </Link>
                      <Link
                        href="/sign-in"
                        className={buttonStyles({
                          variant: "secondary",
                          size: "lg",
                        })}
                      >
                        Try it free
                      </Link>
                    </div>
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
