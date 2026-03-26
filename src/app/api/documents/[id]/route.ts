import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const doc = await prisma.document.findUnique({ where: { id: params.id } });
  if (!doc) return NextResponse.json({ error: "Document non trouvé" }, { status: 404 });

  // Try to delete file
  try {
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    const fileName = doc.fichierUrl.split("/").pop();
    if (fileName) {
      await unlink(path.join(uploadDir, "documents", fileName));
    }
  } catch {}

  await prisma.document.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
