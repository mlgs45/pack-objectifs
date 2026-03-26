import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const departement = searchParams.get("departement") || "";
  const where: any = {};
  if (departement) where.departement = departement;

  const entreprises = await prisma.entreprise.findMany({ where, orderBy: { raisonSociale: "asc" } });

  const headers = ["Raison sociale", "SIRET", "Département", "Ville", "Code postal", "Exportateur", "CA", "CA Export", "Effectif", "Secteurs"];
  const rows = entreprises.map((e) => [
    e.raisonSociale,
    e.siret || "",
    e.departement,
    e.ville || "",
    e.codePostal || "",
    e.exportateur,
    e.ca?.toString() || "",
    e.caExport?.toString() || "",
    e.effectif?.toString() || "",
    e.secteurs.join("; "),
  ]);

  const csv = [headers.join(";"), ...rows.map((r) => r.map((c) => `"${c}"`).join(";"))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="entreprises.csv"',
    },
  });
}
