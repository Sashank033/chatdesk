import Link from "next/link";

export default function WorkspaceNotFoundPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-8 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Workspace not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This workspace does not exist or you do not have access to it.
        </p>

        <div className="mt-6">
          <Link className="text-sm font-medium underline underline-offset-4" href="/dashboard">
            Return to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
