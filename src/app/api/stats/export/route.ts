import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const view = searchParams.get("view") || "prestations";
  const departement = searchParams.get("departement") || "";

  if (view === "entreprises") {
    const where: any = {};
    if (departement) where.departement = departement;

    const entreprises = await prisma.entreprise.findMany({
      where,
      include: { _count: { select: { projets: true } } },
      orderBy: { raisonSociale: "asc" },
    });

    const headers = ["Raison sociale", "SIRET", "Département", "Exportateur", "Nb projets"];
    const rows = entreprises.map((e) => [
      e.raisonSociale, e.siret || "", e.departement, e.exportateur, e._count.projets.toString(),
    ]);
    const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="entreprises-stats.csv"',
      },
    });
  }

  // Prestations view
  const prestations = await prisma.prestation.findMany({
    include: {
      projet: {
        include: {
          entreprise: { select: { raisonSociale: true, departement: true } },
          utilisateurs: { include: { user: { select: { nom: true, prenom: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = ["Type", "Statut", "Entreprise", "Projet", "Département", "Conseillers", "Créé le"];
  const rows = prestations.map((p) => [
    p.type,
    p.statut,
    p.projet.entreprise.raisonSociale,
    p.projet.titre,
    p.projet.entreprise.departement,
    p.projet.utilisateurs.map((u) => `${u.user.prenom} ${u.user.nom}`).join(", "),
    p.createdAt.toISOString().split("T")[0],
  ]);
  const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="prestations-stats.csv"',
    },
  });
}
