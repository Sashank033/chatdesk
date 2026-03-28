"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateAssistantReply, isOpenAIConfigured } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { getWorkspaceMembershipForUser } from "@/lib/workspaces";

const DEFAULT_CONVERSATION_TITLE = "New conversation";

function shouldAutoRenameConversation(title: string) {
  return title === DEFAULT_CONVERSATION_TITLE;
}

function createConversationTitleFromMessage(content: string) {
  const normalized = content.replace(/\s+/g, " ").trim();

  if (!normalized) {
    return DEFAULT_CONVERSATION_TITLE;
  }

  const title = normalized.slice(0, 60).trim();

  return title.length > 0 ? title : DEFAULT_CONVERSATION_TITLE;
}

export async function createConversation(workspaceId: string, formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const membership = await getWorkspaceMembershipForUser(session.user.id, workspaceId);

  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  const titleValue = formData.get("title");

  const title = typeof titleValue === "string" ? titleValue.trim() : "";

  if (title.length > 80) {
    throw new Error("Conversation title must be 80 characters or fewer.");
  }

  await prisma.conversation.create({
    data: {
      title: title || DEFAULT_CONVERSATION_TITLE,
      workspaceId,
    },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
}

export async function renameConversation(
  workspaceId: string,
  conversationId: string,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const membership = await getWorkspaceMembershipForUser(session.user.id, workspaceId);

  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      workspaceId,
    },
    select: {
      id: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const titleValue = formData.get("title");

  if (typeof titleValue !== "string") {
    throw new Error("Conversation title is required.");
  }

  const title = titleValue.trim();

  if (title.length < 2 || title.length > 80) {
    throw new Error("Conversation title must be between 2 and 80 characters.");
  }

  await prisma.conversation.update({
    where: {
      id: conversationId,
    },
    data: {
      title,
    },
  });

  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/conversations/${conversationId}`);
}

export async function createMessage(
  workspaceId: string,
  conversationId: string,
  formData: FormData,
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const membership = await getWorkspaceMembershipForUser(session.user.id, workspaceId);

  if (!membership) {
    throw new Error("You do not have access to this workspace.");
  }

  const conversation = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      workspaceId,
    },
    select: {
      id: true,
      title: true,
    },
  });

  if (!conversation) {
    throw new Error("Conversation not found.");
  }

  const contentValue = formData.get("content");

  if (typeof contentValue !== "string") {
    throw new Error("Message content is required.");
  }

  const content = contentValue.trim();

  if (content.length < 1 || content.length > 4000) {
    throw new Error("Message content must be between 1 and 4000 characters.");
  }

  await prisma.message.create({
    data: {
      conversationId,
      role: "USER",
      content,
    },
  });

  if (shouldAutoRenameConversation(conversation.title)) {
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },
      data: {
        title: createConversationTitleFromMessage(content),
      },
    });
  }

  const history = await prisma.message.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 20,
  });

  const assistantReply = await generateAssistantReply(
    history.map((message) => ({
      role: message.role,
      content: message.content,
    })),
  ).catch(async (error) => {
    const fallbackContent = isOpenAIConfigured
      ? `AI reply could not be generated right now: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      : "AI replies are currently paused. Add OPENAI_API_KEY again when you want to resume live assistant responses.";

    await prisma.message.create({
      data: {
        conversationId,
        role: "SYSTEM",
        content: fallbackContent,
      },
    });

    return null;
  });

  if (assistantReply) {
    await prisma.message.create({
      data: {
        conversationId,
        role: "ASSISTANT",
        content: assistantReply,
      },
    });
  }

  revalidatePath(`/dashboard/${workspaceId}`);
  revalidatePath(`/dashboard/${workspaceId}/conversations/${conversationId}`);
}
