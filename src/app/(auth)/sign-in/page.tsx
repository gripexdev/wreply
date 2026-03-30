import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignInForm } from "@/components/auth/sign-in-form";

export default function SignInPage() {
  return (
    <div className="w-full max-w-xl">
      <AuthFormShell
        title="Sign in to WReply"
        description="Open your workspace."
        footerText="Need a workspace?"
        footerHref="/sign-up"
        footerAction="Create an account"
      >
        <SignInForm />
      </AuthFormShell>
    </div>
  );
}
