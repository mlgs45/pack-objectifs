import { prisma } from "./prisma";

/**
 * Check if a user is assigned to a project
 */
export async function isUserOnProject(userId: string, projetId: string): Promise<boolean> {
  const assignment = await prisma.projetUser.findUnique({
    where: { projetId_userId: { projetId, userId } },
  });
  return !!assignment;
}

/**
 * Check if a user can access a prestation (via project assignment)
 */
export async function canAccessPrestation(userId: string, prestationId: string): Promise<boolean> {
  const prestation = await prisma.prestation.findUnique({
    where: { id: prestationId },
    select: { projetId: true },
  });
  if (!prestation) return false;
  return isUserOnProject(userId, prestation.projetId);
}

/**
 * Check if user is admin
 */
export function isAdmin(session: any): boolean {
  return session?.user?.role === "ADMIN";
}

/**
 * Check if user can modify a project (is assigned or is admin)
 */
export async function canModifyProject(userId: string, role: string, projetId: string): Promise<boolean> {
  if (role === "ADMIN") return true;
  return isUserOnProject(userId, projetId);
}
