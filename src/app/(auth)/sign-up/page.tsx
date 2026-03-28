import { AuthFormShell } from "@/components/auth/auth-form-shell";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <div className="w-full max-w-xl">
      <AuthFormShell
        title="Create your WReply workspace"
        description="Set up the owner account and first workspace. This step only wires the foundation, not onboarding flows."
        footerText="Already have an account?"
        footerHref="/sign-in"
        footerAction="Sign in"
      >
        <SignUpForm />
      </AuthFormShell>
    </div>
  );
}
