import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { z } from "zod";

const userUpdateSchema = z.object({
  nom: z.string().min(1).max(100).optional(),
  prenom: z.string().min(1).max(100).optional(),
  email: z.string().email().optional(),
  role: z.enum(["ADMIN", "CONSEILLER"]).optional(),
  departement: z.string().min(1).max(10).optional(),
  active: z.boolean().optional(),
  password: z.string().min(8).max(100).optional(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  if ((session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = userUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data: any = { ...parsed.data };
  if (data.password) {
    data.password = await hash(data.password, 12);
  } else {
    delete data.password;
  }

  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: { id: true, nom: true, prenom: true, email: true, role: true, departement: true, active: true },
  });

  return NextResponse.json(user);
}
