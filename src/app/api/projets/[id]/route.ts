import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projetSchema } from "@/lib/validators";
import { logAction } from "@/lib/historique";
import { canModifyProject } from "@/lib/authorization";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const projet = await prisma.projet.findUnique({
    where: { id: params.id },
    include: {
      entreprise: true,
      utilisateurs: { include: { user: { select: { id: true, nom: true, prenom: true, email: true, departement: true } } } },
      documents: { orderBy: { createdAt: "desc" } },
      prestations: {
        orderBy: { createdAt: "desc" },
        include: { diagExport: true, oaf: true },
      },
    },
  });

  if (!projet) return NextResponse.json({ error: "Projet non trouvé" }, { status: 404 });
  return NextResponse.json(projet);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Authorization check
  const canModify = await canModifyProject(session.user.id, (session.user as any).role, params.id);
  if (!canModify) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const body = await req.json();
  const parsed = projetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { utilisateurs, ...projetData } = parsed.data;

  await prisma.projetUser.deleteMany({ where: { projetId: params.id } });

  const projet = await prisma.projet.update({
    where: { id: params.id },
    data: {
      ...projetData,
      utilisateurs: {
        create: utilisateurs.map((userId) => ({ userId })),
      },
    },
    include: {
      entreprise: { select: { raisonSociale: true } },
      utilisateurs: { include: { user: { select: { id: true, nom: true, prenom: true } } } },
    },
  });

  await logAction({
    utilisateurId: session.user.id,
    projetId: projet.id,
    action: "Modification du projet",
    detail: { titre: projet.titre },
  });

  return NextResponse.json(projet);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Only admin can delete projects
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.projet.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
