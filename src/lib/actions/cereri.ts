"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function aprobaCerere(rezervareId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.cerereCazare.update({
      where: { rezervareId },
      data: { status: "APROBATA", aprobatLa: new Date(), aprobatDe: "system" },
    });
    const rezervare = await tx.rezervare.update({
      where: { id: rezervareId },
      data: { status: "PLATA_ASTEPTARE" },
    });
    await tx.camera.update({
      where: { id: rezervare.cameraId },
      data: { status: "REZERVATA_PLATA_ASTEPTARE" },
    });
  });
  revalidatePath("/dashboard/cereri");
}

export async function respingeCerere(rezervareId: string) {
  await prisma.$transaction(async (tx) => {
    await tx.cerereCazare.update({
      where: { rezervareId },
      data: { status: "RESPINSA", aprobatLa: new Date(), aprobatDe: "system" },
    });
    const rezervare = await tx.rezervare.update({
      where: { id: rezervareId },
      data: { status: "ANULATA" },
    });
    await tx.camera.update({
      where: { id: rezervare.cameraId },
      data: { status: "DISPONIBILA" },
    });
  });
  revalidatePath("/dashboard/cereri");
}
