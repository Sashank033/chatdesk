"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createWorkspace(formData: FormData) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const name = formData.get("name");

  if (typeof name !== "string") {
    throw new Error("Workspace name is required.");
  }

  const trimmedName = name.trim();

  if (trimmedName.length < 2 || trimmedName.length > 50) {
    throw new Error("Workspace name must be between 2 and 50 characters.");
  }

  await prisma.$transaction(async (tx) => {
    const workspace = await tx.workspace.create({
      data: {
        name: trimmedName,
        ownerId: session.user.id,
      },
    });

    await tx.workspaceMembership.create({
      data: {
        userId: session.user.id,
        workspaceId: workspace.id,
        role: "OWNER",
      },
    });
  });

  revalidatePath("/dashboard");
}
