import type { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "@/database/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

function slugify(value: string) {
  const normalized = value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized || "workspace";
}

export async function generateWorkspaceSlug(
  db: DatabaseClient,
  workspaceName: string,
) {
  const baseSlug = slugify(workspaceName);
  let suffix = 0;

  while (true) {
    const candidate = suffix === 0 ? baseSlug : `${baseSlug}-${suffix + 1}`;
    const existingWorkspace = await db.workspace.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existingWorkspace) {
      return candidate;
    }

    suffix += 1;
  }
}

export async function provisionWorkspaceForUser(
  db: DatabaseClient,
  input: {
    ownerId: string;
    ownerName: string;
    workspaceName?: string;
  },
) {
  const workspaceName =
    input.workspaceName?.trim() || `${input.ownerName.trim()} Workspace`;
  const slug = await generateWorkspaceSlug(db, workspaceName);

  const workspace = await db.workspace.create({
    data: {
      name: workspaceName,
      slug,
      ownerId: input.ownerId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  await db.user.update({
    where: { id: input.ownerId },
    data: {
      workspaceId: workspace.id,
    },
  });

  return workspace;
}

export async function getWorkspaceSummary(workspaceId: string) {
  return prisma.workspace.findUnique({
    where: { id: workspaceId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });
}
