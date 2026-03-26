import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const [data, total] = await Promise.all([
    prisma.alerte.findMany({
      where: { utilisateurId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        historique: {
          include: {
            utilisateur: { select: { nom: true, prenom: true } },
          },
        },
      },
    }),
    prisma.alerte.count({ where: { utilisateurId: session.user.id } }),
  ]);

  return NextResponse.json({ data, total, page, totalPages: Math.ceil(total / limit) });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { ids } = await req.json();

  if (ids && Array.isArray(ids)) {
    await prisma.alerte.updateMany({
      where: { id: { in: ids }, utilisateurId: session.user.id },
      data: { vue: true },
    });
  } else {
    // Mark all as read
    await prisma.alerte.updateMany({
      where: { utilisateurId: session.user.id, vue: false },
      data: { vue: true },
    });
  }

  return NextResponse.json({ success: true });
}
