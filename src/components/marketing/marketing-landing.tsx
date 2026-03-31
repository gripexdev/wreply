import Link from "next/link";
import type { ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Link2,
  MessageSquareText,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Brand } from "@/components/common/brand";
import { Badge } from "@/components/ui/badge";
import { buttonStyles } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Features", href: "#product" },
  { label: "Preview", href: "#surfaces" },
  { label: "Why WReply", href: "#stack" },
] as const;

const overviewCards = [
  {
    title: "Rules",
    label: "Saved replies",
    detail: "price, stock, location, delivery, hours",
  },
  {
    title: "Matching",
    label: "Smart matching",
    detail: "exact, contains, common wording, priority",
  },
  {
    title: "Messages",
    label: "Message history",
    detail: "matched, default reply, prepared, sent, failed",
  },
  {
    title: "Analytics",
    label: "Business view",
    detail: "coverage, delivery, default replies, trends",
  },
] as const;

const productBands = [
  {
    id: "surfaces",
    eyebrow: "Rules",
    title: "Automation blocks for real customer questions.",
    description:
      "Create the reply once. Let WReply handle repeated WhatsApp questions.",
    accent: "cyan",
    cta: "Open rules",
    cards: [
      "Keywords and phrases",
      "Exact or contains",
      "Priority and on/off",
      "Darija and French",
    ],
  },
  {
    id: "messages",
    eyebrow: "Message activity",
    title: "A readable view of every conversation decision.",
    description:
      "See customer messages, matched replies, default replies, and send results in one place.",
    accent: "pink",
    cta: "View messages",
    cards: [
      "Messages and replies",
      "Matched or missed",
      "Prepared, sent, failed",
      "Clear details",
    ],
  },
  {
    id: "analytics",
    eyebrow: "Analytics",
    title: "Signals that show what your automation is really doing.",
    description:
      "Track coverage, default reply use, send results, and your most-used replies.",
    accent: "blue",
    cta: "Open analytics",
    cards: [
      "Coverage over time",
      "Default reply use",
      "Top replies",
      "Reply results",
    ],
  },
  {
    id: "connections",
    eyebrow: "WhatsApp",
    title: "Connection setup that stays clear and operational.",
    description:
      "Connect your WhatsApp number, confirm your setup, and keep everything easy to follow.",
    accent: "purple",
    cta: "Manage connection",
    cards: [
      "Message URL ready",
      "Owner-only access",
      "Draft or live sending",
      "One number, one setup",
    ],
  },
] as const;

const stackItems = [
  "Rules",
  "Matching",
  "Fallback",
  "Logs",
  "Analytics",
  "WhatsApp",
] as const;

function SectionHeader({
  badge,
  title,
  description,
}: Readonly<{
  badge: string;
  title: string;
  description: string;
}>) {
  return (
    <div className="mx-auto max-w-3xl space-y-3 text-center">
      <Badge className="border-primary/15 bg-primary/10 text-primary">
        {badge}
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

function WorkflowCard({
  title,
  label,
  detail,
}: Readonly<{
  title: string;
  label: string;
  detail: string;
}>) {
  return (
    <Card className="marketing-surface rounded-[24px] transition duration-200 hover:-translate-y-0.5 hover:border-white/[0.12]">
      <CardContent className="p-5">
        <p className="text-[0.66rem] tracking-[0.18em] text-white/34 uppercase">
          {label}
        </p>
        <p className="font-display mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">
          {title}
        </p>
        <p className="mt-2 text-sm leading-6 text-white/56">{detail}</p>
      </CardContent>
    </Card>
  );
}

function ProductPointCard({
  label,
}: Readonly<{
  label: string;
}>) {
  return (
    <Card className="marketing-surface rounded-[22px] transition duration-200 hover:-translate-y-0.5">
      <CardContent className="flex min-h-[56px] items-center justify-center px-4 py-3 text-center">
        <p className="text-[0.92rem] leading-5 font-semibold text-white">
          {label}
        </p>
      </CardContent>
    </Card>
  );
}

function AccentPreview({
  accent,
  children,
}: Readonly<{
  accent: "cyan" | "pink" | "blue" | "purple";
  children: React.ReactNode;
}>) {
  const accentClass =
    accent === "pink"
      ? "marketing-glow-pink"
      : accent === "blue"
        ? "marketing-glow-blue"
        : accent === "purple"
          ? "marketing-glow-purple"
          : "marketing-glow-cyan";

  return (
    <div
      className={cn("marketing-stage rounded-[30px] p-5 sm:p-6", accentClass)}
    >
      {children}
    </div>
  );
}

function BandIcon({
  icon: Icon,
}: Readonly<{
  icon: ComponentType<{ className?: string }>;
}>) {
  return (
    <span className="text-primary flex h-11 w-11 items-center justify-center rounded-[18px] border border-white/[0.08] bg-white/[0.04]">
      <Icon className="h-4 w-4" />
    </span>
  );
}

function DockCard({
  title,
  detail,
}: Readonly<{
  title: string;
  detail: string;
}>) {
  return (
    <div className="rounded-[20px] border border-white/[0.08] bg-[rgba(8,12,21,0.82)] p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-white/54">{detail}</p>
    </div>
  );
}

function ProductBandPreview({
  id,
  accent,
}: Readonly<{
  id: (typeof productBands)[number]["id"];
  accent: (typeof productBands)[number]["accent"];
}>) {
  if (id === "messages") {
    return (
      <AccentPreview accent={accent}>
        <div className="flex min-h-[21rem] flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-3">
            <span className="marketing-chip">Message stream</span>
            <span className="marketing-chip">Fallback visible</span>
          </div>
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
            <div className="max-w-[70%] rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(21,43,74,0.78),rgba(11,22,40,0.96))] px-5 py-4 text-sm leading-7 text-[#EFF6FF]">
              fin kayn lmagasin?
            </div>
            <div className="ml-auto max-w-[76%] rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(58,28,81,0.82),rgba(17,15,38,0.98))] px-5 py-4 text-sm leading-7 text-[#F5F3FF]">
              Rahna f Maarif. Google Maps link kayn hna.
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <DockCard title="Matched rule" detail="location" />
            <DockCard title="Send state" detail="Prepared or sent" />
            <DockCard title="Operator note" detail="Everything stays visible" />
          </div>
        </div>
      </AccentPreview>
    );
  }

  if (id === "analytics") {
    return (
      <AccentPreview accent={accent}>
        <div className="flex min-h-[21rem] flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-3">
            <span className="marketing-chip">Analytics</span>
            <span className="marketing-chip">Workspace scoped</span>
          </div>
          <div className="grid flex-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] border border-white/[0.08] bg-[rgba(8,12,21,0.8)] p-5">
              <div className="mb-5 flex items-end gap-3">
                {[34, 52, 44, 78, 68, 92, 70].map((height, index) => (
                  <div
                    key={index}
                    className="flex-1 rounded-full bg-white/[0.04] p-1"
                  >
                    <div
                      className="w-full rounded-full bg-[linear-gradient(180deg,#3B82F6,#22D3EE)]"
                      style={{ height }}
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-white/56">Incoming over time</p>
            </div>
            <div className="grid gap-3">
              <DockCard
                title="Match rate"
                detail="See coverage over the selected range"
              />
              <DockCard
                title="Fallback"
                detail="Track when no rule took the message"
              />
              <DockCard
                title="Top replies"
                detail="See which replies customers use most"
              />
            </div>
          </div>
        </div>
      </AccentPreview>
    );
  }

  if (id === "connections") {
    return (
      <AccentPreview accent={accent}>
        <div className="flex min-h-[21rem] flex-col justify-between gap-6">
          <div className="flex items-center justify-between gap-3">
            <span className="marketing-chip">WhatsApp setup</span>
            <span className="marketing-chip">Ready to receive</span>
          </div>
          <div className="grid flex-1 gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[24px] border border-white/[0.08] bg-[rgba(8,12,21,0.8)] p-5">
              <p className="text-[0.66rem] tracking-[0.18em] text-white/34 uppercase">
                Setup
              </p>
              <div className="mt-5 space-y-3">
                <DockCard title="Phone number ID" detail="Stored securely" />
                <DockCard
                  title="Verification token"
                  detail="Used to confirm your setup"
                />
                <DockCard title="App secret" detail="Extra security" />
              </div>
            </div>
            <div className="rounded-[24px] border border-white/[0.08] bg-[rgba(8,12,21,0.8)] p-5">
              <p className="text-[0.66rem] tracking-[0.18em] text-white/34 uppercase">
                Current status
              </p>
              <div className="mt-5 space-y-3">
                <DockCard title="Messages" detail="Confirmed and receiving" />
                <DockCard title="Send mode" detail="Prepared or live" />
                <DockCard
                  title="Connected number"
                  detail="Bound to one connection"
                />
              </div>
            </div>
          </div>
        </div>
      </AccentPreview>
    );
  }

  return (
    <AccentPreview accent={accent}>
      <div className="flex min-h-[21rem] flex-col justify-between gap-6">
        <div className="flex items-center justify-between gap-3">
          <span className="marketing-chip">Rule builder</span>
          <span className="marketing-chip">Priority order</span>
        </div>
        <div className="grid flex-1 gap-4 lg:grid-cols-[0.95fr_0.2fr_1.05fr]">
          <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(18,38,72,0.76),rgba(9,18,34,0.96))] p-5">
            <p className="text-[0.66rem] tracking-[0.18em] text-[#DBEAFE]/62 uppercase">
              Trigger
            </p>
            <p className="mt-6 text-sm font-semibold text-white">
              prix / taman / chhal
            </p>
          </div>
          <div className="text-primary flex items-center justify-center">
            <Workflow className="h-5 w-5" />
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(42,28,78,0.76),rgba(14,15,35,0.98))] p-5">
            <p className="text-[0.66rem] tracking-[0.18em] text-[#F5F3FF]/62 uppercase">
              Reply
            </p>
            <p className="mt-6 text-sm leading-7 text-[#F5F3FF]">
              Salam. Send the product name or photo and we will reply quickly.
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <DockCard title="Active toggle" detail="Turn automation on or off" />
          <DockCard title="Language tag" detail="Any, Darija, or French" />
          <DockCard
            title="Rule order"
            detail="Deterministic winner selection"
          />
        </div>
      </div>
    </AccentPreview>
  );
}

export function MarketingLanding() {
  return (
    <div className="marketing-page marketing-grid marketing-rail min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-[1380px] flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="marketing-surface sticky top-4 z-30 flex items-center justify-between rounded-[24px] px-4 py-3 sm:px-5">
          <Brand compact />

          <nav className="hidden items-center gap-5 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[0.78rem] text-white/46 transition hover:text-white/86"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/sign-in"
              className={buttonStyles({
                variant: "ghost",
                className: "h-9 rounded-[14px] px-4 text-[0.78rem]",
              })}
            >
              Login
            </Link>
            <Link
              href="/sign-up"
              className={buttonStyles({
                className: "h-9 rounded-[14px] px-4 text-[0.78rem]",
              })}
            >
              Start free
            </Link>
          </div>
        </header>

        <main className="flex-1 pb-20">
          <section className="mx-auto flex max-w-5xl flex-col items-center px-2 pt-16 text-center sm:pt-20 lg:pt-24">
            <Badge className="border-primary/15 bg-primary/10 text-primary">
              WReply
            </Badge>

            <h1 className="font-display mt-6 text-5xl font-semibold tracking-[-0.08em] text-white sm:text-6xl lg:text-7xl xl:text-[5.4rem]">
              Automate the replies.
              <span className="text-gradient block">
                Keep the business moving.
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/54 sm:text-base">
              Automatic WhatsApp replies for Moroccan businesses. Set your
              replies, stay on top of messages, and keep everything easy to
              manage.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/sign-up" className={buttonStyles({ size: "lg" })}>
                Start automating replies
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/sign-in"
                className={buttonStyles({
                  variant: "secondary",
                  size: "lg",
                  className:
                    "bg-[linear-gradient(180deg,rgba(12,18,30,0.86),rgba(7,11,20,0.96))]",
                })}
              >
                Open dashboard
              </Link>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-[0.7rem] tracking-[0.18em] text-white/38 uppercase">
              <span>Darija + French</span>
              <span className="h-1 w-1 rounded-full bg-white/18" />
              <span>WhatsApp-focused</span>
              <span className="h-1 w-1 rounded-full bg-white/18" />
              <span>Easy to follow</span>
            </div>

            <div className="mt-12 w-full">
              <div className="marketing-stage marketing-glow-cyan rounded-[30px] p-5 sm:p-6 lg:p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="marketing-chip">Live overview</span>
                  <span className="marketing-chip">Message to reply</span>
                </div>

                <div className="mt-6 rounded-[28px] border border-white/[0.08] bg-[rgba(6,10,18,0.86)] p-6 sm:p-8">
                  <div className="mx-auto flex min-h-[18rem] max-w-3xl flex-col items-center justify-center">
                    <div className="relative flex h-52 w-full items-center justify-center rounded-[28px] border border-white/[0.08] bg-[linear-gradient(180deg,rgba(8,12,21,0.92),rgba(4,7,13,0.98))]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.12),transparent_42%)]" />
                      <div className="marketing-chip absolute top-5 left-5">
                        Message in
                      </div>
                      <div className="marketing-chip absolute top-5 right-5">
                        Reply out
                      </div>
                      <div className="relative flex flex-col items-center gap-4 text-center">
                        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-white/72">
                          chhal taman?
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/[0.08] bg-[radial-gradient(circle,rgba(34,211,238,0.2),rgba(9,14,25,0.2)_58%,transparent_72%)] shadow-[0_0_40px_-18px_rgba(34,211,238,0.34)]">
                          <Workflow className="text-primary h-5 w-5" />
                        </div>
                        <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-xs text-white/72">
                          send pricing reply
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {overviewCards.map((card) => (
                    <WorkflowCard key={card.title} {...card} />
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="product" className="mt-24 space-y-8 sm:mt-28 lg:mt-32">
            <SectionHeader
              badge="One place"
              title="Every surface stays connected."
              description="Create replies, see messages, track results."
            />

            <div className="grid gap-14">
              {productBands.map((band, index) => {
                const Icon =
                  band.id === "messages"
                    ? MessageSquareText
                    : band.id === "analytics"
                      ? BarChart3
                      : band.id === "connections"
                        ? Link2
                        : Bot;

                return (
                  <section key={band.id} id={band.id} className="space-y-7">
                    <div className="mx-auto max-w-4xl space-y-4 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <BandIcon icon={Icon} />
                        <Badge className="border-white/[0.08] bg-white/[0.03] text-white/66">
                          {band.eyebrow}
                        </Badge>
                      </div>
                      <h2 className="font-display text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl lg:text-[3.4rem]">
                        {band.title}
                      </h2>
                      <p className="mx-auto max-w-2xl text-sm leading-7 text-white/54 sm:text-base">
                        {band.description}
                      </p>
                    </div>

                    <div className="mx-auto max-w-6xl">
                      <ProductBandPreview id={band.id} accent={band.accent} />
                    </div>

                    <div className="mx-auto grid max-w-6xl gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {band.cards.map((card) => (
                        <ProductPointCard key={card} label={card} />
                      ))}
                    </div>

                    <div className="flex justify-center">
                      <Link
                        href={index % 2 === 0 ? "/sign-up" : "/sign-in"}
                        className={buttonStyles({
                          className:
                            "h-10 rounded-full px-5 text-[0.78rem] shadow-[0_18px_40px_-28px_rgba(34,211,238,0.4)]",
                        })}
                      >
                        {band.cta}
                      </Link>
                    </div>
                  </section>
                );
              })}
            </div>
          </section>

          <section id="stack" className="mt-24 space-y-8 sm:mt-28 lg:mt-32">
            <SectionHeader
              badge="Why WReply"
              title="One place for replies, messages, and results."
              description="Clear, fast, and easy to run every day."
            />

            <div className="marketing-surface rounded-[30px] p-6 sm:p-8">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stackItems.map((item) => (
                  <div
                    key={item}
                    className="rounded-[22px] border border-white/[0.08] bg-white/[0.03] px-4 py-5 text-center"
                  >
                    <Sparkles className="text-primary mx-auto h-4 w-4" />
                    <p className="mt-4 text-sm font-semibold text-white">
                      {item}
                    </p>
                  </div>
                ))}
              </div>

              <div className="marketing-divider mt-8" />

              <div className="mt-8 flex flex-col items-center justify-between gap-5 lg:flex-row">
                <div className="max-w-xl">
                  <p className="font-display text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">
                    Premium by default.
                    <span className="text-gradient block">
                      Built for growing businesses.
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-7 text-white/54 sm:text-base">
                    Connect WhatsApp, set your replies, and stay in control.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/sign-up"
                    className={buttonStyles({ size: "lg" })}
                  >
                    Start free
                  </Link>
                  <Link
                    href="/sign-in"
                    className={buttonStyles({
                      variant: "secondary",
                      size: "lg",
                    })}
                  >
                    Sign in
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
