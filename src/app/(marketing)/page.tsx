import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  MessageSquareText,
  Package,
  Radar,
  ScanSearch,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Brand } from "@/components/common/brand";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Product", href: "#product" },
  { label: "Signals", href: "#signals" },
  { label: "Use cases", href: "#use-cases" },
] as const;

const surfaces = [
  {
    icon: Bot,
    title: "Rules",
    eyebrow: "Trigger blocks",
    detail: "Build price, stock, location, and hours flows.",
  },
  {
    icon: ScanSearch,
    title: "Matching",
    eyebrow: "Ranked engine",
    detail: "Exact, contains, aliases, and deterministic priority.",
  },
  {
    icon: MessageSquareText,
    title: "Messages",
    eyebrow: "Live activity",
    detail: "Inspect inbound questions, fallbacks, and reply outcomes.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    eyebrow: "Operator view",
    detail: "See coverage, delivery, fallback, and rule performance.",
  },
] as const;

const systemSignals = [
  {
    label: "Rule coverage",
    value: "Exact + contains",
    hint: "Mixed Darija and French input.",
  },
  {
    label: "Message flow",
    value: "Inbound to reply",
    hint: "One loop for logs, fallback, and delivery.",
  },
  {
    label: "Workspace safety",
    value: "Scoped",
    hint: "Connections, rules, and analytics stay isolated.",
  },
] as const;

const workflow = [
  {
    label: "Message in",
    title: "Customer asks on WhatsApp",
    hint: "prix, chhal, stock, livraison, horaires",
  },
  {
    label: "Normalize",
    title: "Text gets cleaned and ranked",
    hint: "case, punctuation, aliases, and priority",
  },
  {
    label: "Reply path",
    title: "Rule or fallback takes over",
    hint: "prepared or sent, with honest delivery status",
  },
  {
    label: "Review",
    title: "Logs and analytics stay readable",
    hint: "matched, unmatched, fallback, delivery",
  },
] as const;

const useCases = [
  {
    icon: ShoppingBag,
    title: "Shops",
    questions: ["price", "stock", "delivery"],
    outcome: "Keep product questions moving without copy-paste.",
  },
  {
    icon: Scissors,
    title: "Salons",
    questions: ["hours", "address", "booking"],
    outcome: "Answer fast while the team stays on the floor.",
  },
  {
    icon: Package,
    title: "Brands",
    questions: ["location", "support", "availability"],
    outcome: "Keep every customer line consistent and trackable.",
  },
] as const;

function SectionHeading({
  eyebrow,
  title,
  description,
  centered = false,
}: Readonly<{
  eyebrow: string;
  title: string;
  description: string;
  centered?: boolean;
}>) {
  return (
    <div
      className={cn(
        "space-y-3",
        centered ? "mx-auto max-w-3xl text-center" : "max-w-2xl",
      )}
    >
      <Badge className="border-primary/15 bg-primary/10 text-primary">
        {eyebrow}
      </Badge>
      <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <p className="text-sm leading-7 text-white/54 sm:text-base">
        {description}
      </p>
    </div>
  );
}

function SurfaceCard({
  icon: Icon,
  eyebrow,
  title,
  detail,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  detail: string;
}>) {
  return (
    <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.92),rgba(7,11,19,0.98))]">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
            <Icon className="h-4 w-4" />
          </span>
          <ChevronRight className="h-4 w-4 text-white/32" />
        </div>

        <div className="mt-8 space-y-3">
          <p className="text-[0.66rem] tracking-[0.2em] text-white/36 uppercase">
            {eyebrow}
          </p>
          <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white">
            {title}
          </h3>
          <p className="text-sm leading-6 text-white/58">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LandingPage() {
  return (
    <div className="shell-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1420px] flex-col px-6 py-6 sm:px-8 lg:px-10">
        <header className="panel-sheen sticky top-4 z-20 flex items-center justify-between rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,14,25,0.82),rgba(6,10,18,0.9))] px-5 py-4 backdrop-blur-2xl">
          <Brand compact />

          <nav className="hidden items-center gap-6 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-white/48 transition hover:text-white/86"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className={buttonStyles({ variant: "ghost" })}
            >
              Sign in
            </Link>
            <Link href="/sign-up" className={buttonStyles()}>
              Start free
            </Link>
          </div>
        </header>

        <main className="flex-1 py-10 sm:py-12 lg:py-16">
          <div className="space-y-24 sm:space-y-28 lg:space-y-32">
            <section className="relative overflow-hidden rounded-[40px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(9,14,25,0.72),rgba(6,10,18,0.18))] px-5 py-10 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.15),transparent_58%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.12),transparent_48%)]" />
              <div className="pointer-events-none absolute top-24 left-[-8rem] h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.12),transparent_72%)] blur-3xl" />
              <div className="pointer-events-none absolute right-[-10rem] bottom-[-8rem] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(236,72,153,0.08),transparent_72%)] blur-3xl" />

              <div className="relative mx-auto max-w-4xl space-y-6 text-center">
                <Badge className="border-primary/15 bg-primary/10 text-primary">
                  WhatsApp automation
                </Badge>

                <div className="space-y-4">
                  <h1 className="font-display text-5xl font-semibold tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                    Automate every first reply.
                    <span className="text-gradient block">
                      Keep the human follow-up.
                    </span>
                  </h1>
                  <p className="mx-auto max-w-2xl text-sm leading-7 text-white/58 sm:text-base lg:text-lg">
                    WReply watches incoming WhatsApp traffic, matches the right
                    rule, logs the full decision, and keeps your team in
                    control.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4">
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

                <div className="flex flex-wrap items-center justify-center gap-3 text-xs tracking-[0.18em] text-white/42 uppercase">
                  <span>Darija + French</span>
                  <span className="h-1 w-1 rounded-full bg-white/22" />
                  <span>Rules + fallback</span>
                  <span className="h-1 w-1 rounded-full bg-white/22" />
                  <span>Logs + analytics</span>
                </div>
              </div>

              <div className="relative mx-auto mt-12 max-w-6xl">
                <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(10,16,29,0.96),rgba(7,11,20,0.99))]">
                  <CardContent className="p-0">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] px-5 py-4 sm:px-6">
                      <div>
                        <p className="text-[0.64rem] tracking-[0.22em] text-white/34 uppercase">
                          Live workspace
                        </p>
                        <p className="mt-1 text-sm font-semibold text-white">
                          WReply Control
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-primary/15 bg-primary/10 text-primary">
                          System live
                        </Badge>
                        <Badge className="border-white/[0.08] bg-white/[0.03] text-white/66">
                          24/7 monitoring
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[1fr_0.78fr_1fr]">
                      <div className="space-y-4 rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(17,35,69,0.72),rgba(9,18,33,0.96))] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.64rem] tracking-[0.2em] text-[#DBEAFE]/62 uppercase">
                            Incoming
                          </p>
                          <Badge className="border-white/[0.08] bg-black/18 text-white/70">
                            Customer
                          </Badge>
                        </div>

                        <div className="rounded-[24px] border border-white/[0.08] bg-black/18 p-4">
                          <p className="text-sm leading-7 text-[#EFF6FF]">
                            &quot;chhal taman dyal had produit?&quot;
                          </p>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Normalized
                            </p>
                            <p className="mt-2 text-sm text-white/74">
                              chhal taman dyal had produit
                            </p>
                          </div>
                          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Alias hit
                            </p>
                            <p className="mt-2 text-sm text-white/74">
                              price / taman / chhal
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="relative overflow-hidden rounded-[34px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(10,16,31,0.94),rgba(8,11,22,0.98))] p-5">
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.16),transparent_38%),radial-gradient(circle_at_bottom,rgba(168,85,247,0.12),transparent_46%)]" />
                        <div className="relative flex h-full min-h-[20rem] flex-col items-center justify-center text-center">
                          <div className="absolute top-5 left-5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.64rem] tracking-[0.18em] text-white/56 uppercase">
                            exact
                          </div>
                          <div className="absolute top-5 right-5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.64rem] tracking-[0.18em] text-white/56 uppercase">
                            contains
                          </div>
                          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-[0.64rem] tracking-[0.18em] text-white/56 uppercase">
                            priority
                          </div>

                          <div className="flex h-40 w-40 items-center justify-center rounded-full border border-white/[0.08] bg-[radial-gradient(circle,rgba(34,211,238,0.16),rgba(10,16,31,0.24)_58%,transparent_70%)] shadow-[0_0_46px_-20px_rgba(34,211,238,0.34),0_0_60px_-28px_rgba(168,85,247,0.28)]">
                            <div className="space-y-2">
                              <Badge className="border-primary/15 bg-primary/10 text-primary">
                                Matching engine
                              </Badge>
                              <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-white">
                                Ranked
                              </p>
                              <p className="text-sm text-white/54">
                                Rule selection
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 rounded-[30px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(38,26,76,0.76),rgba(14,16,35,0.98))] p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-[0.64rem] tracking-[0.2em] text-[#F5F3FF]/62 uppercase">
                            Reply path
                          </p>
                          <Badge className="border-white/[0.08] bg-black/18 text-white/70">
                            Rule match
                          </Badge>
                        </div>

                        <div className="space-y-3">
                          <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Winner
                            </p>
                            <p className="mt-2 text-sm font-semibold text-white">
                              price
                            </p>
                          </div>
                          <div className="rounded-[22px] border border-white/[0.08] bg-black/18 p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Reply
                            </p>
                            <p className="mt-2 text-sm leading-7 text-[#F5F3FF]">
                              Salam. Send the product name or photo and we will
                              reply quickly.
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Log state
                            </p>
                            <p className="mt-2 text-sm text-white/74">
                              Prepared or sent
                            </p>
                          </div>
                          <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.04] p-4">
                            <p className="text-[0.64rem] tracking-[0.18em] text-white/36 uppercase">
                              Operator view
                            </p>
                            <p className="mt-2 text-sm text-white/74">
                              Messages and analytics
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 border-t border-white/[0.08] p-5 sm:grid-cols-2 xl:grid-cols-4 xl:p-6">
                      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          Active rules
                        </p>
                        <p className="mt-3 text-sm font-semibold text-white">
                          Priority sorted
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          Messages today
                        </p>
                        <p className="mt-3 text-sm font-semibold text-white">
                          Live intake
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          Fallback
                        </p>
                        <p className="mt-3 text-sm font-semibold text-white">
                          Ready when needed
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          Delivery
                        </p>
                        <p className="mt-3 text-sm font-semibold text-white">
                          Honest send status
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section id="product" className="space-y-8">
              <SectionHeading
                centered
                eyebrow="Product"
                title="One control center. Four surfaces."
                description="Build coverage, test replies, inspect traffic, and improve from live operator data."
              />

              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                {surfaces.map((surface) => (
                  <SurfaceCard key={surface.title} {...surface} />
                ))}
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.06fr_0.94fr]">
                <Card className="overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.94),rgba(8,11,20,0.98))]">
                  <CardContent className="p-6 sm:p-7">
                    <div className="flex items-center gap-3">
                      <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
                        <Workflow className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          Reply loop
                        </p>
                        <h3 className="font-display mt-1 text-2xl font-semibold tracking-[-0.04em] text-white">
                          One message path
                        </h3>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      {workflow.map((item, index) => (
                        <div
                          key={item.label}
                          className="relative rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5"
                        >
                          {index < workflow.length - 1 ? (
                            <div className="pointer-events-none absolute top-[4.4rem] left-[1.45rem] h-8 w-px bg-gradient-to-b from-white/18 to-transparent" />
                          ) : null}
                          <div className="flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-xs font-semibold text-white/74">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                                {item.label}
                              </p>
                              <p className="mt-2 text-sm font-semibold text-white">
                                {item.title}
                              </p>
                              <p className="mt-1 text-sm text-white/52">
                                {item.hint}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div id="signals" className="grid gap-4">
                  {systemSignals.map((signal) => (
                    <Card
                      key={signal.label}
                      className="overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.94),rgba(8,11,20,0.98))]"
                    >
                      <CardContent className="p-6">
                        <p className="text-[0.64rem] tracking-[0.18em] text-white/34 uppercase">
                          {signal.label}
                        </p>
                        <p className="font-display mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                          {signal.value}
                        </p>
                        <p className="mt-3 text-sm leading-6 text-white/56">
                          {signal.hint}
                        </p>
                      </CardContent>
                    </Card>
                  ))}

                  <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.94),rgba(8,11,20,0.98))]">
                    <CardContent className="p-6 sm:p-7">
                      <div className="flex items-start justify-between gap-4">
                        <div className="max-w-md">
                          <Badge className="border-primary/15 bg-primary/10 text-primary">
                            Live monitoring
                          </Badge>
                          <h3 className="font-display mt-4 text-3xl font-semibold tracking-[-0.05em] text-white">
                            Built for fast operators
                          </h3>
                          <p className="mt-3 text-sm leading-7 text-white/56">
                            Clear rules. Honest delivery. No black box.
                          </p>
                        </div>
                        <ShieldCheck className="mt-1 h-5 w-5 text-white/32" />
                      </div>

                      <div className="mt-8 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <Clock3 className="text-primary h-4 w-4" />
                          <p className="mt-3 text-sm text-white/76">
                            Fast first reply
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <Sparkles className="text-primary h-4 w-4" />
                          <p className="mt-3 text-sm text-white/76">
                            Clean rule ranking
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] p-4">
                          <Radar className="text-primary h-4 w-4" />
                          <p className="mt-3 text-sm text-white/76">
                            Trace every outcome
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section id="use-cases" className="space-y-8">
              <SectionHeading
                centered
                eyebrow="Use cases"
                title="Built for Moroccan WhatsApp traffic."
                description="Shops, salons, and brands all get the same advantage: faster first replies and cleaner operator visibility."
              />

              <div className="grid gap-4 lg:grid-cols-3">
                {useCases.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.title}
                      className="overflow-hidden bg-[linear-gradient(180deg,rgba(12,18,31,0.94),rgba(8,11,20,0.98))]"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <Badge className="border-white/[0.08] bg-white/[0.03] text-white/66">
                            Live fit
                          </Badge>
                        </div>

                        <div className="mt-8 space-y-3">
                          <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-white">
                            {item.title}
                          </h3>
                          <p className="text-sm leading-6 text-white/58">
                            {item.outcome}
                          </p>
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {item.questions.map((question) => (
                            <span
                              key={question}
                              className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-white/68"
                            >
                              {question}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="surface-glow overflow-hidden bg-[linear-gradient(180deg,rgba(11,17,29,0.95),rgba(8,11,19,0.99))]">
                <CardContent className="relative p-6 sm:p-8 lg:p-10">
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.14),transparent_58%),radial-gradient(circle_at_top_right,rgba(236,72,153,0.1),transparent_52%)]" />

                  <div className="relative grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
                    <div className="space-y-4">
                      <Badge className="border-primary/15 bg-primary/10 text-primary">
                        Why it feels different
                      </Badge>
                      <h3 className="font-display text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl">
                        Not a chatbot facade.
                        <span className="text-gradient block">
                          A real operator system.
                        </span>
                      </h3>
                      <p className="max-w-xl text-sm leading-7 text-white/58 sm:text-base">
                        Rules, matching, logs, fallback, and delivery all stay
                        visible. Your team sees what the system did and why.
                      </p>

                      <div className="flex flex-wrap gap-3">
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
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                        <CheckCircle2 className="text-primary h-5 w-5" />
                        <p className="mt-4 text-sm font-semibold text-white">
                          Clear rule winners
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">
                          Priority and tie-breaks stay deterministic.
                        </p>
                      </div>
                      <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                        <MapPin className="text-primary h-5 w-5" />
                        <p className="mt-4 text-sm font-semibold text-white">
                          Workspace scoped
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">
                          Each line, rule set, and log stream stays isolated.
                        </p>
                      </div>
                      <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                        <Radar className="text-primary h-5 w-5" />
                        <p className="mt-4 text-sm font-semibold text-white">
                          Full visibility
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">
                          See matched, unmatched, fallback, sent, and failed.
                        </p>
                      </div>
                      <div className="rounded-[26px] border border-white/[0.08] bg-white/[0.03] p-5">
                        <Sparkles className="text-primary h-5 w-5" />
                        <p className="mt-4 text-sm font-semibold text-white">
                          Built for mixed phrasing
                        </p>
                        <p className="mt-2 text-sm leading-6 text-white/56">
                          Darija, French, and mixed input stay usable.
                        </p>
                      </div>
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
