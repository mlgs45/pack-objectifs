import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { projetSchema } from "@/lib/validators";
import { logAction } from "@/lib/historique";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const entrepriseId = searchParams.get("entrepriseId") || "";
  const type = searchParams.get("type") || "";
  const departement = searchParams.get("departement") || "";
  const userId = searchParams.get("userId") || "";
  const pays = searchParams.get("pays") || "";
  const mine = searchParams.get("mine") === "true";

  const where: any = {};
  if (search) {
    where.OR = [
      { titre: { contains: search, mode: "insensitive" } },
      { entreprise: { raisonSociale: { contains: search, mode: "insensitive" } } },
    ];
  }
  if (entrepriseId) where.entrepriseId = entrepriseId;
  if (type) where.type = type;
  if (departement) where.entreprise = { ...where.entreprise, departement };
  if (userId) where.utilisateurs = { some: { userId } };
  if (mine) where.utilisateurs = { some: { userId: session.user.id } };
  if (pays) {
    where.OR = [
      ...(where.OR || []),
      { paysExportCibles: { has: pays } },
      { paysExportEnCours: { has: pays } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.projet.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        entreprise: { select: { id: true, raisonSociale: true, departement: true } },
        utilisateurs: { include: { user: { select: { id: true, nom: true, prenom: true } } } },
        _count: { select: { prestations: true, documents: true } },
      },
    }),
    prisma.projet.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = projetSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { utilisateurs, ...projetData } = parsed.data;

  const projet = await prisma.projet.create({
    data: {
      ...projetData,
      createdBy: session.user.id,
      utilisateurs: {
        create: [
          { userId: session.user.id },
          ...utilisateurs.filter((u) => u !== session.user.id).map((userId) => ({ userId })),
        ],
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
    action: "Création du projet",
    detail: { titre: projet.titre },
  });

  return NextResponse.json(projet, { status: 201 });
}
