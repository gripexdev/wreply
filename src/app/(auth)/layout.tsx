import { CheckCircle2, ShieldCheck } from "lucide-react";

import { Brand } from "@/components/common/brand";
import { Badge } from "@/components/ui/badge";

const authHighlights = [
  "Sign in fast.",
  "Open your workspace.",
  "Manage replies in one place.",
];

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen px-6 py-6 sm:px-8 lg:px-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-black/20 shadow-[0_40px_140px_-70px_rgba(8,14,28,0.95)] backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
        <section className="hidden flex-col justify-between border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(30,181,142,0.28),transparent_35%),linear-gradient(180deg,rgba(12,20,35,0.8),rgba(6,12,22,0.92))] p-10 lg:flex">
          <div className="space-y-8">
            <Brand />
            <div className="space-y-5">
              <Badge className="border-primary/30 bg-primary/10 text-primary">
                WReply
              </Badge>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
                WhatsApp replies, under control.
              </h1>
              <p className="text-muted-foreground max-w-lg text-sm leading-7">
                Simple access. Clear control.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {authHighlights.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/[0.03] p-4"
              >
                <CheckCircle2 className="text-primary mt-0.5 h-5 w-5" />
                <p className="text-muted-foreground text-sm leading-6">
                  {item}
                </p>
              </div>
            ))}
            <div className="border-primary/20 bg-primary/10 text-primary flex items-center gap-3 rounded-[24px] border p-4">
              <ShieldCheck className="h-5 w-5" />
              <p className="text-sm font-medium">Secure by default.</p>
            </div>
          </div>
        </section>
        <section className="flex items-center justify-center p-6 sm:p-10">
          {children}
        </section>
      </div>
    </div>
  );
}
