import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement") || "";
  const type = searchParams.get("type") || "";
  const view = searchParams.get("view") || "prestations";

  const projetWhere: any = {};
  if (departement) projetWhere.entreprise = { departement };
  if (type) projetWhere.type = type;

  const [totalProjets, totalEntreprises, totalPrestations, prestationsByType, projetsByType, entreprisesByDept] = await Promise.all([
    prisma.projet.count({ where: projetWhere }),
    prisma.entreprise.count(departement ? { where: { departement } } : undefined),
    prisma.prestation.count({
      where: { projet: projetWhere },
    }),
    prisma.prestation.groupBy({
      by: ["type"],
      _count: true,
      where: { projet: projetWhere },
    }),
    prisma.projet.groupBy({
      by: ["type"],
      _count: true,
      where: projetWhere,
    }),
    prisma.entreprise.groupBy({
      by: ["departement"],
      _count: true,
    }),
  ]);

  return NextResponse.json({
    totalProjets,
    totalEntreprises,
    totalPrestations,
    prestationsByType,
    projetsByType,
    entreprisesByDept,
  });
}
