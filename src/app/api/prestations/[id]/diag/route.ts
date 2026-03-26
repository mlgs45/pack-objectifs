import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessPrestation, isAdmin } from "@/lib/authorization";
import { z } from "zod";

const diagUpdateSchema = z.object({
  criteres: z.record(z.object({
    note: z.number().int().min(0).max(4),
    commentaire: z.string().max(1000).default(""),
  })).optional(),
  restitution: z.object({
    swot: z.object({
      forces: z.array(z.object({ text: z.string().max(500), cotation: z.number().int().min(-2).max(2) })),
      faiblesses: z.array(z.object({ text: z.string().max(500), cotation: z.number().int().min(-2).max(2) })),
      opportunites: z.array(z.object({ text: z.string().max(500), cotation: z.number().int().min(-2).max(2) })),
      menaces: z.array(z.object({ text: z.string().max(500), cotation: z.number().int().min(-2).max(2) })),
    }).optional(),
    preconisations: z.record(z.string().max(10000)).optional(),
    commentaires: z.string().max(10000).optional(),
  }).optional(),
}).refine(data => data.criteres !== undefined || data.restitution !== undefined, {
  message: "Au moins un champ requis",
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  if (!isAdmin(session) && !(await canAccessPrestation(session.user.id, params.id))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = diagUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const diag = await prisma.diagExport.update({
    where: { prestationId: params.id },
    data: {
      ...(parsed.data.criteres !== undefined && { criteres: parsed.data.criteres }),
      ...(parsed.data.restitution !== undefined && { restitution: parsed.data.restitution }),
    },
  });

  return NextResponse.json(diag);
}
