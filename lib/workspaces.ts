import { prisma } from "@/lib/prisma";

export async function getWorkspaceMembershipForUser(userId: string, workspaceId: string) {
  return prisma.workspaceMembership.findUnique({
    where: {
      userId_workspaceId: {
        userId,
        workspaceId,
      },
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
          conversations: {
            orderBy: {
              updatedAt: "desc",
            },
          },
          
          memberships: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      },
    },
  });
}
