import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSchema } from "@/lib/validators";
import { hash } from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const minimal = searchParams.get("minimal") === "true";

  if (minimal) {
    // For project assignment - return id, nom, prenom only
    const users = await prisma.user.findMany({
      where: { active: true },
      select: { id: true, nom: true, prenom: true, departement: true },
      orderBy: { nom: "asc" },
    });
    return NextResponse.json(users);
  }

  // Full list (admin only)
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { nom: "asc" },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email: true,
      role: true,
      departement: true,
      active: true,
      createdAt: true,
      _count: { select: { projets: true } },
    },
  });

  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = userSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 });
  }

  if (!parsed.data.password || parsed.data.password.length < 8) {
    return NextResponse.json({ error: "Mot de passe requis (8 caractères minimum)" }, { status: 400 });
  }
  const hashedPassword = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      nom: parsed.data.nom,
      prenom: parsed.data.prenom,
      email: parsed.data.email,
      password: hashedPassword,
      role: parsed.data.role,
      departement: parsed.data.departement,
    },
  });

  return NextResponse.json({ id: user.id, nom: user.nom, prenom: user.prenom, email: user.email }, { status: 201 });
}
