import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xl">
      <AuthFormShell
        title="Create your WReply account"
        description="Start in minutes."
        footerText="Already have an account?"
        footerHref="/sign-in"
        footerAction="Sign in"
      >
        <SignUpForm />
      </AuthFormShell>
    </div>
  );
}
