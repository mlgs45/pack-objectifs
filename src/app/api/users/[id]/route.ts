import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validators";
import { hash } from "bcryptjs";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();

  const data: any = {};
  if (body.nom) data.nom = body.nom;
  if (body.prenom) data.prenom = body.prenom;
  if (body.email) data.email = body.email;
  if (body.role) data.role = body.role;
  if (body.departement) data.departement = body.departement;
  if (body.active !== undefined) data.active = body.active;
  if (body.password) data.password = await hash(body.password, 12);

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, nom: true, prenom: true, email: true, role: true, departement: true, active: true },
  });

  return NextResponse.json(user);
}
