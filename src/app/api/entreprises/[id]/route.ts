import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entrepriseSchema } from "@/lib/validators";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const entreprise = await prisma.entreprise.findUnique({
    where: { id: params.id },
    include: {
      projets: {
        include: {
          utilisateurs: { include: { user: { select: { id: true, nom: true, prenom: true } } } },
          prestations: { select: { id: true, type: true, statut: true } },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });

  if (!entreprise) return NextResponse.json({ error: "Entreprise non trouvée" }, { status: 404 });
  return NextResponse.json(entreprise);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = entrepriseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entreprise = await prisma.entreprise.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      dateCreation: parsed.data.dateCreation ? new Date(parsed.data.dateCreation) : null,
    },
  });

  return NextResponse.json(entreprise);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.entreprise.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
