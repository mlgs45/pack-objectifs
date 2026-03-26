import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const count = await prisma.alerte.count({
    where: { utilisateurId: session.user.id, vue: false },
  });

  return NextResponse.json({ count });
}
