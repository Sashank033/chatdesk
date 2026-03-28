import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 text-foreground">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-xl items-center justify-center">
        <div className="w-full rounded-2xl border bg-card p-8 shadow-sm">
          <h1 className="text-3xl font-bold">ChatDesk</h1>
          <p className="mt-3 text-muted-foreground">
            Full-stack AI chatbot project.
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            Home page test. We are isolating the route so the app can boot cleanly again.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth/signin"
              className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium"
            >
              Open dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
