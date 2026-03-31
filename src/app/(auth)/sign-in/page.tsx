import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="w-full max-w-xl">
      <AuthFormShell
        title="Sign in to WReply"
        description="Open your dashboard."
        footerText="New to WReply?"
        footerHref="/sign-up"
        footerAction="Create account"
      >
        <SignInForm />
      </AuthFormShell>
    </div>
  );
}
