import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

  const uploadDir = process.env.UPLOAD_DIR || "./uploads";
  const baseDir = path.resolve(uploadDir, "documents");
  const filePath = path.resolve(baseDir, params.filename);

  // Prevent path traversal
  if (!filePath.startsWith(baseDir)) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  // Only allow safe filename characters
  if (!/^[a-zA-Z0-9._-]+$/.test(params.filename)) {
    return NextResponse.json({ error: "Nom de fichier invalide" }, { status: 400 });
  }

  try {
    const file = await readFile(filePath);
    const ext = path.extname(params.filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".pdf": "application/pdf",
      ".doc": "application/msword",
      ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ".xls": "application/vnd.ms-excel",
      ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
    };

    return new NextResponse(file, {
      headers: {
        "Content-Type": mimeTypes[ext] || "application/octet-stream",
        "Content-Disposition": `inline; filename="${params.filename}"`,
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "Fichier non trouvé" }, { status: 404 });
  }
}
