"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, AppError, logAudit } from "@/lib/security";

export async function aprobaCerere(rezervareId: string) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV");
  const cerere = await prisma.cerereCazare.findUnique({
    where: { rezervareId },
    include: { rezervare: { include: { camera: true } } },
  });
  if (!cerere) throw new AppError("Cererea nu există", "NOT_FOUND");
  if (cerere.status !== "IN_ASTEPTARE") throw new AppError("Cererea a fost deja procesată", "ALREADY_PROCESSED");

  await prisma.$transaction(async (tx) => {
    await tx.cerereCazare.update({
      where: { rezervareId },
      data: { status: "APROBATA", aprobatLa: new Date(), aprobatDe: user.id },
    });
    await tx.rezervare.update({ where: { id: rezervareId }, data: { status: "PLATA_ASTEPTARE" } });
    await tx.camera.update({ where: { id: cerere.rezervare.cameraId }, data: { status: "REZERVATA_PLATA_ASTEPTARE" } });
  });

  await logAudit(user.id, "CERERE_APROBATA", { rezervareId });
  revalidatePath("/dashboard/cereri");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function respingeCerere(rezervareId: string) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV");
  const cerere = await prisma.cerereCazare.findUnique({
    where: { rezervareId },
    include: { rezervare: true },
  });
  if (!cerere) throw new AppError("Cererea nu există", "NOT_FOUND");
  if (cerere.status !== "IN_ASTEPTARE") throw new AppError("Cererea a fost deja procesată", "ALREADY_PROCESSED");

  await prisma.$transaction(async (tx) => {
    await tx.cerereCazare.update({
      where: { rezervareId },
      data: { status: "RESPINSA", aprobatLa: new Date(), aprobatDe: user.id },
    });
    await tx.rezervare.update({ where: { id: rezervareId }, data: { status: "ANULATA" } });
    await tx.camera.update({ where: { id: cerere.rezervare.cameraId }, data: { status: "DISPONIBILA" } });
  });

  await logAudit(user.id, "CERERE_RESPINSA", { rezervareId });
  revalidatePath("/dashboard/cereri");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}
