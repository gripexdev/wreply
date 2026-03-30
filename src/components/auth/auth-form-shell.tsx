import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function AuthFormShell({
  title,
  description,
  footerText,
  footerHref,
  footerAction,
  children,
}: Readonly<{
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerAction: string;
  children: React.ReactNode;
}>) {
  return (
    <Card className="border-white/10 bg-black/20">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl text-white">{title}</CardTitle>
        <CardDescription className="max-w-md">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {children}
        <p className="text-muted-foreground text-sm">
          {footerText}{" "}
          <Link
            href={footerHref}
            className="text-primary font-semibold transition hover:text-[#57d9b7]"
          >
            {footerAction}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
