import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { CreateMessageForm } from "@/components/dashboard/create-message-form";
import { RenameConversationForm } from "@/components/dashboard/rename-conversation-form";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWorkspaceMembershipForUser } from "@/lib/workspaces";
import { createMessage, renameConversation } from "../../actions";

type ConversationPageProps = {
  params: Promise<{
    workspaceId: string;
    conversationId: string;
  }>;
};

async function createMessageAction(
  workspaceId: string,
  conversationId: string,
  _: { error?: string },
  formData: FormData,
) {
  "use server";

  try {
    await createMessage(workspaceId, conversationId, formData);
    return {};
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to create message." };
  }
}

async function renameConversationAction(
  workspaceId: string,
  conversationId: string,
  _: { error?: string },
  formData: FormData,
) {
  "use server";

  try {
    await renameConversation(workspaceId, conversationId, formData);
    return {};
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: "Unable to rename conversation." };
  }
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const { workspaceId, conversationId } = await params;
  const membership = await getWorkspaceMembershipForUser(session.user.id, workspaceId);

  if (!membership) {
    notFound();
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      workspaceId,
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
      },
      workspace: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[300px_1fr]">
        <aside className="rounded-2xl border bg-card p-6 shadow-sm">
          <p className="text-sm font-medium text-muted-foreground">Workspace</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {membership.workspace.name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Browse conversations inside this protected workspace.
          </p>

          <div className="mt-6 space-y-2">
            {membership.workspace.conversations.map((workspaceConversation) => {
              const isActive = workspaceConversation.id === conversation.id;

              return (
                <Link
                  key={workspaceConversation.id}
                  href={`/dashboard/${workspaceId}/conversations/${workspaceConversation.id}`}
                  className={`block rounded-xl border p-4 transition-colors ${
                    isActive
                      ? "border-primary bg-accent/40"
                      : "hover:bg-accent/20"
                  }`}
                >
                  <p className="font-medium">{workspaceConversation.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(workspaceConversation.updatedAt).toLocaleDateString()}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm font-medium">
            <Link className="underline underline-offset-4" href={`/dashboard/${workspaceId}`}>
              Back to workspace
            </Link>
            <Link className="underline underline-offset-4" href="/dashboard">
              Back to dashboard
            </Link>
          </div>
        </aside>

        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">
                {conversation.workspace.name}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight">{conversation.title}</h2>
              <p className="text-sm text-muted-foreground">
                Messages are persisted to the database. If AI is paused, ChatDesk will keep the
                conversation usable and show a friendly system note instead of breaking.
              </p>
            </div>

            <SignOutButton className="w-full sm:w-auto" />
          </div>

          <div className="mt-6 rounded-xl border bg-background p-5">
            <h3 className="text-base font-semibold">Rename conversation</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Give this thread a clearer title any time.
            </p>

            <div className="mt-4">
              <RenameConversationForm
                action={renameConversationAction.bind(null, workspaceId, conversationId)}
                defaultValue={conversation.title}
              />
            </div>
          </div>

          <div className="mt-8 rounded-2xl border bg-background">
            <div className="border-b p-6">
              <h3 className="text-lg font-semibold">Chat</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Send a message to continue this conversation. New conversations are
                automatically renamed from the first user message.
              </p>
            </div>

            <div className="space-y-4 p-6">
              {conversation.messages.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6">
                  <h3 className="font-medium">No messages yet</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start the conversation with your first message.
                  </p>
                </div>
              ) : (
                conversation.messages.map((message) => {
                  const isUser = message.role === "USER";
                  const isAssistant = message.role === "ASSISTANT";

                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-3xl rounded-2xl border p-4 shadow-sm ${
                          isUser
                            ? "bg-primary text-primary-foreground"
                            : isAssistant
                              ? "bg-card"
                              : "bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4 text-xs">
                          <span
                            className={`rounded-full border px-3 py-1 font-medium ${
                              isUser ? "border-primary-foreground/30" : ""
                            }`}
                          >
                            {message.role}
                          </span>
                          <span className={isUser ? "text-primary-foreground/80" : "text-muted-foreground"}>
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                          {message.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t p-6">
              <CreateMessageForm
                action={createMessageAction.bind(
                  null,
                  workspaceId,
                  conversationId,
                )}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
