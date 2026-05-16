import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const cerereId = formData.get("cerereId") as string;
    const files = formData.getAll("files") as File[];

    if (!cerereId || files.length === 0) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", cerereId);
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await writeFile(filePath, buffer);

      await prisma.documentAtasat.create({
        data: {
          cerereId,
          tip: "ALTE_DOCUMENTE",
          numeFisier: file.name,
          caleFisier: `/uploads/${cerereId}/${fileName}`,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
