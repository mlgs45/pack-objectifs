import { prisma } from "./prisma";

export async function logAction(params: {
  utilisateurId: string;
  projetId?: string;
  prestationId?: string;
  action: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  detail?: any;
}) {
  const historique = await prisma.historiqueModification.create({
    data: {
      utilisateurId: params.utilisateurId,
      projetId: params.projetId,
      prestationId: params.prestationId,
      action: params.action,
      detail: params.detail ?? undefined,
    },
  });

  // Create alerts for all users assigned to this project
  if (params.projetId) {
    const projetUsers = await prisma.projetUser.findMany({
      where: { projetId: params.projetId },
      select: { userId: true },
    });

    const alertes = projetUsers
      .filter((pu) => pu.userId !== params.utilisateurId)
      .map((pu) => ({
        utilisateurId: pu.userId,
        historiqueId: historique.id,
      }));

    if (alertes.length > 0) {
      await prisma.alerte.createMany({ data: alertes });
    }
  }

  return historique;
}
