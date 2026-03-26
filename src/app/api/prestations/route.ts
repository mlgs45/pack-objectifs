import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prestationSchema } from "@/lib/validators";
import { logAction } from "@/lib/historique";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const parsed = prestationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prestation = await prisma.prestation.create({
    data: {
      type: parsed.data.type,
      projetId: parsed.data.projetId,
      createdBy: session.user.id,
      ...(parsed.data.type === "DIAG_EXPORT" && {
        diagExport: { create: { criteres: {} } },
      }),
      ...(parsed.data.type === "OAF" && {
        oaf: { create: { paysActions: [] } },
      }),
    },
    include: { diagExport: true, oaf: true },
  });

  await logAction({
    utilisateurId: session.user.id,
    projetId: parsed.data.projetId,
    prestationId: prestation.id,
    action: `Création prestation ${parsed.data.type}`,
  });

  return NextResponse.json(prestation, { status: 201 });
}
