import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CreateWorkspaceForm } from "@/components/dashboard/create-workspace-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createWorkspace } from "./actions";

async function createWorkspaceAction(_: { error?: string }, formData: FormData) {
  "use server";

  try {
    await createWorkspace(formData);
    return {};
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to create workspace." };
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const memberships = await prisma.workspaceMembership.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      workspace: {
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Welcome, {session.user.name ?? session.user.email ?? "User"}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This dashboard is protected and now supports multi-workspace membership.
          </p>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <section className="rounded-xl border bg-background p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">Your workspaces</h2>
                  <p className="text-sm text-muted-foreground">
                    Workspaces where you are an owner or member.
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {memberships.length} workspace{memberships.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {memberships.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
                    No workspaces yet. Create your first workspace to start organizing ChatDesk.
                  </div>
                ) : (
                  memberships.map((membership) => {
                    const isOwner = membership.workspace.ownerId === session.user.id;
                    const ownerLabel =
                      membership.workspace.owner.name ??
                      membership.workspace.owner.email ??
                      "Unknown owner";

                    return (
                      <div
                        key={membership.id}
                        className="rounded-xl border p-5 transition-colors hover:bg-accent/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{membership.workspace.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {isOwner ? "Owned by you" : `Owned by ${ownerLabel}`}
                            </p>
                          </div>
                          <span className="rounded-full border px-3 py-1 text-xs font-medium">
                            {membership.role}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-xl border bg-background p-5">
              <h2 className="text-lg font-semibold">Create workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                New workspaces are created under your ownership and added to your membership list.
              </p>

              <div className="mt-5">
                <CreateWorkspaceForm action={createWorkspaceAction} />
              </div>
            </section>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <p>User ID: {session.user.id}</p>
            <p>Email: {session.user.email ?? "Unavailable"}</p>
          </div>

          <div className="mt-6">
            <Link className="text-sm font-medium underline underline-offset-4" href="/">
              Return home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
