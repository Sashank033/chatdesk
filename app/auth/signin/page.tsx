import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { authOptions } from "@/lib/auth";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 text-foreground">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">ChatDesk</p>
          <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">
            Continue with Google to access your dashboard and protected chatbot routes.
          </p>
        </div>

        <div className="mt-8 space-y-3">
          <GoogleSignInButton />

          <Button asChild variant="ghost" className="w-full">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
