import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessPrestation, isAdmin } from "@/lib/authorization";
import { z } from "zod";

const oafActionSchema = z.object({
  id: z.string(),
  type: z.string().max(200),
  dateDebut: z.string().max(20).default(""),
  dateFin: z.string().max(20).default(""),
  statut: z.enum(["PREVU", "EN_COURS", "REALISE"]),
  montantPrevisionnel: z.number().min(0).default(0),
  montantRealise: z.number().min(0).default(0),
  commentaire: z.string().max(1000).default(""),
});

const oafPaysSchema = z.object({
  code: z.string().length(2),
  nom: z.string().max(200),
  ca: z.number().min(0).default(0),
  actions: z.array(oafActionSchema).max(100),
});

const oafUpdateSchema = z.object({
  dateDebut: z.string().optional().nullable(),
  dateFin: z.string().optional().nullable(),
  paysActions: z.array(oafPaysSchema).max(50).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!isAdmin(session) && !(await canAccessPrestation(session.user.id, params.id))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = oafUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const oaf = await prisma.oAF.update({
    where: { prestationId: params.id },
    data: {
      ...(parsed.data.dateDebut !== undefined && { dateDebut: parsed.data.dateDebut ? new Date(parsed.data.dateDebut) : null }),
      ...(parsed.data.dateFin !== undefined && { dateFin: parsed.data.dateFin ? new Date(parsed.data.dateFin) : null }),
      ...(parsed.data.paysActions !== undefined && { paysActions: parsed.data.paysActions }),
    },
  });

  return NextResponse.json(oaf);
}
