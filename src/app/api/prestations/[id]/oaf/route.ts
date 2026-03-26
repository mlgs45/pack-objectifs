import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  const oaf = await prisma.oAF.update({
    where: { prestationId: params.id },
    data: {
      ...(body.dateDebut !== undefined && { dateDebut: body.dateDebut ? new Date(body.dateDebut) : null }),
      ...(body.dateFin !== undefined && { dateFin: body.dateFin ? new Date(body.dateFin) : null }),
      ...(body.paysActions !== undefined && { paysActions: body.paysActions }),
    },
  });

  return NextResponse.json(oaf);
}
