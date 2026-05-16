"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCursant(formData: FormData) {
  const nume = formData.get("nume") as string;
  const prenume = formData.get("prenume") as string;
  const telefon = formData.get("telefon") as string;
  const email = formData.get("email") as string;
  const firma = formData.get("firma") as string;

  await prisma.cursant.create({
    data: { nume, prenume, telefon: telefon || null, email: email || null, firma: firma || null },
  });

  revalidatePath("/dashboard/cursanti");
}

export async function updateCursant(id: string, formData: FormData) {
  const nume = formData.get("nume") as string;
  const prenume = formData.get("prenume") as string;
  const telefon = formData.get("telefon") as string;
  const email = formData.get("email") as string;
  const firma = formData.get("firma") as string;

  await prisma.cursant.update({
    where: { id },
    data: { nume, prenume, telefon: telefon || null, email: email || null, firma: firma || null },
  });

  revalidatePath("/dashboard/cursanti");
}

export async function deleteCursant(id: string) {
  await prisma.cursant.delete({ where: { id } });
  revalidatePath("/dashboard/cursanti");
}

export async function createCurs(formData: FormData) {
  const denumire = formData.get("denumire") as string;
  const durataZile = parseInt(formData.get("durataZile") as string) || 1;

  await prisma.curs.create({
    data: { denumire, durataZile },
  });

  revalidatePath("/dashboard/cursuri");
}

export async function toggleCursActiv(id: string, activ: boolean) {
  await prisma.curs.update({ where: { id }, data: { activ } });
  revalidatePath("/dashboard/cursuri");
}

export async function updateCurs(id: string, formData: FormData) {
  const denumire = formData.get("denumire") as string;
  const durataZile = parseInt(formData.get("durataZile") as string) || 1;
  await prisma.curs.update({
    where: { id },
    data: { denumire, durataZile },
  });
  revalidatePath("/dashboard/cursuri");
}

export async function deleteCurs(id: string) {
  await prisma.curs.delete({ where: { id } });
  revalidatePath("/dashboard/cursuri");
}

export async function createInscriere(cursantId: string, cursId: string, dataStart: string, dataEnd: string) {
  await prisma.inscriereCurs.create({
    data: {
      cursantId,
      cursId,
      dataStart: new Date(dataStart),
      dataEnd: new Date(dataEnd),
    },
  });
  revalidatePath("/dashboard/cursuri");
  revalidatePath("/dashboard/cursanti");
}

export async function updateCameraStatus(id: string, status: string, motiv?: string) {
  await prisma.camera.update({
    where: { id },
    data: {
      status: status as "DISPONIBILA" | "REZERVATA_PLATA_ASTEPTARE" | "REZERVATA_SI_ACHITATA" | "INDISPONIBILA_TEMPORAR" | "OCUPATA",
      motivIndisponibil: motiv || null,
    },
  });
  revalidatePath("/dashboard/camere");
}

export async function createRezervare(formData: FormData) {
  const cursantId = formData.get("cursantId") as string;
  const cameraId = formData.get("cameraId") as string;
  const checkIn = formData.get("checkIn") as string;
  const checkOut = formData.get("checkOut") as string;

  const rezervare = await prisma.rezervare.create({
    data: {
      cursantId,
      cameraId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      status: "PLATA_ASTEPTARE",
    },
  });

  await prisma.cerereCazare.create({
    data: { rezervareId: rezervare.id, status: "APROBATA" },
  });

  await prisma.camera.update({
    where: { id: cameraId },
    data: { status: "REZERVATA_PLATA_ASTEPTARE" },
  });

  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function createParcare(formData: FormData) {
  const numarLoc = formData.get("numarLoc") as string;
  await prisma.parcare.create({ data: { numarLoc } });
  revalidatePath("/dashboard/parcare");
}

export async function toggleParcare(id: string, status: string, cameraId?: string) {
  await prisma.parcare.update({
    where: { id },
    data: {
      status: status as "LIBER" | "OCUPAT" | "REZERVAT",
      cameraId: cameraId || null,
    },
  });
  revalidatePath("/dashboard/parcare");
}

export async function deleteParcare(id: string) {
  await prisma.parcare.delete({ where: { id } });
  revalidatePath("/dashboard/parcare");
}

export async function createObiectPierdut(formData: FormData) {
  const descriere = formData.get("descriere") as string;
  const cameraId = formData.get("cameraId") as string;

  await prisma.obiectPierdut.create({
    data: {
      descriere,
      cameraId: cameraId || undefined,
      gasitLa: new Date(),
    },
  });
  revalidatePath("/dashboard/obiecte-pierdute");
}

export async function restituieObiect(id: string) {
  await prisma.obiectPierdut.update({
    where: { id },
    data: { status: "RESTITUIT", predatLa: new Date() },
  });
  revalidatePath("/dashboard/obiecte-pierdute");
}

export async function anuleazaRezervare(id: string) {
  const rezervare = await prisma.rezervare.findUnique({ where: { id }, select: { cameraId: true } });

  await prisma.rezervare.update({
    where: { id },
    data: { status: "ANULATA" },
  });

  if (rezervare) {
    await prisma.camera.update({
      where: { id: rezervare.cameraId },
      data: { status: "DISPONIBILA" },
    });
  }

  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}
