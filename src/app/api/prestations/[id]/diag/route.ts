import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const body = await req.json();

  const diag = await prisma.diagExport.update({
    where: { prestationId: params.id },
    data: {
      ...(body.criteres !== undefined && { criteres: body.criteres }),
      ...(body.restitution !== undefined && { restitution: body.restitution }),
    },
  });

  return NextResponse.json(diag);
}
