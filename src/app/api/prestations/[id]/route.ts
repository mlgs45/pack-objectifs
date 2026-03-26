import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessPrestation, isAdmin } from "@/lib/authorization";
import { z } from "zod";

const updatePrestationSchema = z.object({
  statut: z.enum(["EN_COURS", "ARCHIVE"]),
});

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const prestation = await prisma.prestation.findUnique({
    where: { id: params.id },
    include: {
      projet: {
        include: {
          entreprise: true,
          utilisateurs: { include: { user: { select: { id: true, nom: true, prenom: true } } } },
        },
      },
      diagExport: true,
      oaf: true,
    },
  });

  if (!prestation) return NextResponse.json({ error: "Prestation non trouvée" }, { status: 404 });
  return NextResponse.json(prestation);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Authorization
  if (!isAdmin(session) && !(await canAccessPrestation(session.user.id, params.id))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updatePrestationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prestation = await prisma.prestation.update({
    where: { id: params.id },
    data: {
      statut: parsed.data.statut,
      archivedAt: parsed.data.statut === "ARCHIVE" ? new Date() : null,
    },
  });

  return NextResponse.json(prestation);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  // Only admin or assigned users can delete
  if (!isAdmin(session) && !(await canAccessPrestation(session.user.id, params.id))) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  await prisma.prestation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
