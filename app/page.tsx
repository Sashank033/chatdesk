import Link from "next/link";
import { getServerSession } from "next-auth";
import { Button } from "@/components/ui/button";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const userCount = await prisma.user.count();
  const workspaceCount = await prisma.workspace.count();

  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
      <div className="w-full max-w-xl rounded-2xl border p-8 space-y-4 shadow-sm">
        <h1 className="text-3xl font-bold">ChatDesk</h1>
        <p className="text-muted-foreground">Full-stack AI chatbot project.</p>

        <div className="space-y-2 text-sm">
          <p>Database connected ✅</p>
          <p>Users in DB: {userCount}</p>
          <p>Workspaces in DB: {workspaceCount}</p>
        </div>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          {session?.user ? (
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Sign in with Google</Link>
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
