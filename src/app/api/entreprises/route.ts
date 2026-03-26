import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { entrepriseSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  const search = searchParams.get("search") || "";
  const departement = searchParams.get("departement") || "";
  const secteur = searchParams.get("secteur") || "";
  const exportateur = searchParams.get("exportateur") || "";

  const where: any = {};
  if (search) {
    where.OR = [
      { raisonSociale: { contains: search, mode: "insensitive" } },
      { siret: { contains: search, mode: "insensitive" } },
      { ville: { contains: search, mode: "insensitive" } },
    ];
  }
  if (departement) where.departement = departement;
  if (secteur) where.secteurs = { has: secteur };
  if (exportateur) where.exportateur = exportateur;

  const [data, total] = await Promise.all([
    prisma.entreprise.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { projets: true } } },
    }),
    prisma.entreprise.count({ where }),
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = entrepriseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const entreprise = await prisma.entreprise.create({
    data: {
      ...parsed.data,
      dateCreation: parsed.data.dateCreation ? new Date(parsed.data.dateCreation) : null,
    },
  });

  return NextResponse.json(entreprise, { status: 201 });
}
