import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { CreateConversationForm } from "@/components/dashboard/create-conversation-form";
import { authOptions } from "@/lib/auth";
import { getWorkspaceMembershipForUser } from "@/lib/workspaces";
import { createConversation } from "./actions";

type WorkspacePageProps = {
  params: Promise<{
    workspaceId: string;
  }>;
};

async function createConversationAction(
  workspaceId: string,
  _: { error?: string },
  formData: FormData,
) {
  "use server";

  try {
    await createConversation(workspaceId, formData);
    return {};
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to create conversation." };
  }
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { workspaceId } = await params;
  const membership = await getWorkspaceMembershipForUser(session.user.id, workspaceId);

  if (!membership) {
    notFound();
  }

  const { workspace } = membership;
  const ownerLabel = workspace.owner.name ?? workspace.owner.email ?? "Unknown owner";

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Workspace</p>
              <h1 className="text-3xl font-semibold tracking-tight">{workspace.name}</h1>
              <p className="text-sm text-muted-foreground">
                This workspace is protected. Only members can open it.
              </p>
            </div>

            <div className="rounded-xl border bg-background px-4 py-3 text-sm">
              <p>
                Role: <span className="font-medium">{membership.role}</span>
              </p>
              <p className="mt-1 text-muted-foreground">Owner: {ownerLabel}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <section className="rounded-xl border bg-background p-6">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create and manage chat threads inside this workspace. If you leave the title
                blank, ChatDesk will name it from the first message.
              </p>

              <CreateConversationForm
                action={createConversationAction.bind(null, workspace.id)}
              />

              <div className="mt-6 space-y-3">
                {workspace.conversations.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6">
                    <h3 className="font-medium">No conversations yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Create your first conversation in this workspace to start building the chat
                      experience.
                    </p>
                  </div>
                ) : (
                  workspace.conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={`/dashboard/${workspace.id}/conversations/${conversation.id}`}
                      className="block rounded-xl border p-4 transition-colors hover:bg-accent/30"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-medium">{conversation.title}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Open this conversation
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="rounded-xl border bg-background p-6">
                <h2 className="text-lg font-semibold">Members</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Current users who can access this workspace.
                </p>

                <div className="mt-5 space-y-3">
                  {workspace.memberships.map((workspaceMember) => {
                    const memberLabel =
                      workspaceMember.user.name ??
                      workspaceMember.user.email ??
                      "Unnamed user";

                    return (
                      <div
                        key={workspaceMember.id}
                        className="flex items-center justify-between rounded-xl border p-4"
                      >
                        <div>
                          <p className="font-medium">{memberLabel}</p>
                          <p className="text-sm text-muted-foreground">
                            {workspaceMember.user.email ?? "No email available"}
                          </p>
                        </div>
                        <span className="rounded-full border px-3 py-1 text-xs font-medium">
                          {workspaceMember.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl border bg-background p-6">
                <h2 className="text-lg font-semibold">Workspace info</h2>
                <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                  <p>Workspace ID: {workspace.id}</p>
                  <p>Members: {workspace.memberships.length}</p>
                  <p>Conversations: {workspace.conversations.length}</p>
                </div>
              </div>
            </section>
          </div>

          <div className="mt-8">
            <Link className="text-sm font-medium underline underline-offset-4" href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
