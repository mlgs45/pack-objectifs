import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx",
  ".png", ".jpg", ".jpeg", ".gif", ".webp",
  ".csv", ".txt", ".zip",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const projetId = searchParams.get("projetId");
  const isRessource = searchParams.get("isRessource") === "true";
  const search = searchParams.get("search") || "";

  const where: any = {};
  if (projetId) where.projetId = projetId;
  if (isRessource) where.isRessource = true;
  if (search) {
    where.OR = [
      { titre: { contains: search, mode: "insensitive" } },
      { commentaire: { contains: search, mode: "insensitive" } },
    ];
  }

  const documents = await prisma.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(documents);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const titre = formData.get("titre") as string;
  const commentaire = formData.get("commentaire") as string | null;
  const projetId = formData.get("projetId") as string | null;
  const isRessource = formData.get("isRessource") === "true";

  if (!file || !titre) {
    return NextResponse.json({ error: "Fichier et titre requis" }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Fichier trop volumineux (max 10 Mo)" }, { status: 400 });
  }

  // Validate file extension
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: `Type de fichier non autorisé: ${ext}` }, { status: 400 });
  }

  // Sanitize filename
  const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const subDir = path.join(uploadDir, "documents");
  await mkdir(subDir, { recursive: true });

  const filePath = path.join(subDir, safeFileName);

  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const document = await prisma.document.create({
    data: {
      titre: titre.slice(0, 200), // Limit title length
      commentaire: commentaire?.slice(0, 1000) || null, // Limit comment length
      projetId: projetId || null,
      isRessource,
      fichierUrl: `/api/documents/file/${safeFileName}`,
      fichierNom: file.name.slice(0, 200),
      fichierSize: file.size,
    },
  });

  return NextResponse.json(document, { status: 201 });
}
