"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireRole, validateRequired, validateOptional, logAudit, AppError } from "@/lib/security";
import type { StatusCamera } from "@/generated/prisma/client";

export async function createCursant(formData: FormData) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV", "CONDUCERE");
  const required = validateRequired(formData, "nume", "prenume");
  const opt = validateOptional(formData, "telefon", "email", "firma");

  const cursant = await prisma.cursant.create({
    data: { nume: required.nume, prenume: required.prenume, ...opt },
  });
  await logAudit(user.id, "CURSANT_CREAT", { cursantId: cursant.id, nume: `${required.nume} ${required.prenume}` });
  revalidatePath("/dashboard/cursanti");
}

export async function updateCursant(id: string, formData: FormData) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV", "CONDUCERE");
  const required = validateRequired(formData, "nume", "prenume");
  const opt = validateOptional(formData, "telefon", "email", "firma");

  await prisma.cursant.update({
    where: { id },
    data: { nume: required.nume, prenume: required.prenume, ...opt },
  });
  await logAudit(user.id, "CURSANT_UPDAT", { cursantId: id });
  revalidatePath("/dashboard/cursanti");
}

export async function deleteCursant(id: string) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV");
  const rezervari = await prisma.rezervare.count({ where: { cursantId: id, status: { notIn: ["CHECKOUT_EFFECTUAT", "ANULATA"] } } });
  if (rezervari > 0) throw new AppError("Cursantul are rezervări active. Anulați-le întâi.", "HAS_ACTIVE");

  await prisma.cursant.delete({ where: { id } });
  await logAudit(user.id, "CURSANT_STERS", { cursantId: id });
  revalidatePath("/dashboard/cursanti");
}

export async function createCurs(formData: FormData) {
  const user = await requireRole("PROGRAMARE", "CONDUCERE");
  const required = validateRequired(formData, "denumire");
  const durataZile = parseInt(formData.get("durataZile") as string) || 1;
  const categorie = formData.get("categorie") as string | null;

  const curs = await prisma.curs.create({
    data: { denumire: required.denumire, durataZile, categorie: categorie as "MARITIM" | "FLUVIAL" | "OFFSHORE" | "ONSHORE" | null | undefined },
  });
  await logAudit(user.id, "CURS_CREAT", { cursId: curs.id, denumire: required.denumire });
  revalidatePath("/dashboard/cursuri");
}

export async function updateCurs(id: string, formData: FormData) {
  const user = await requireRole("PROGRAMARE", "CONDUCERE");
  const required = validateRequired(formData, "denumire");
  const durataZile = parseInt(formData.get("durataZile") as string) || 1;
  const categorie = formData.get("categorie") as string | null;

  await prisma.curs.update({
    where: { id },
    data: { denumire: required.denumire, durataZile, categorie: categorie as "MARITIM" | "FLUVIAL" | "OFFSHORE" | "ONSHORE" | null | undefined },
  });
  await logAudit(user.id, "CURS_UPDAT", { cursId: id });
  revalidatePath("/dashboard/cursuri");
}

export async function deleteCurs(id: string) {
  const user = await requireRole("PROGRAMARE", "CONDUCERE");
  await prisma.curs.delete({ where: { id } });
  await logAudit(user.id, "CURS_STERS", { cursId: id });
  revalidatePath("/dashboard/cursuri");
}

export async function toggleCursActiv(id: string, activ: boolean) {
  await requireRole("PROGRAMARE", "CONDUCERE");
  await prisma.curs.update({ where: { id }, data: { activ } });
  revalidatePath("/dashboard/cursuri");
}

export async function createInscriere(cursantId: string, cursId: string, dataStart: string, dataEnd: string) {
  const user = await requireRole("PROGRAMARE", "ADMINISTRATIV");
  if (!dataStart || !dataEnd) throw new AppError("Datele de început și sfârșit sunt obligatorii", "VALIDATION");
  if (new Date(dataEnd) <= new Date(dataStart)) throw new AppError("Data de sfârșit trebuie să fie după data de început", "VALIDATION");

  await prisma.inscriereCurs.create({
    data: { cursantId, cursId, dataStart: new Date(dataStart), dataEnd: new Date(dataEnd) },
  });
  await logAudit(user.id, "INSCRIERE_CREATA", { cursantId, cursId });
  revalidatePath("/dashboard/cursuri");
  revalidatePath("/dashboard/cursanti");
}

export async function updateCameraStatus(id: string, status: string, motiv?: string) {
  const user = await requireRole("ADMINISTRATIV", "CONDUCERE");
  const validStatuses = ["DISPONIBILA", "REZERVATA_PLATA_ASTEPTARE", "REZERVATA_SI_ACHITATA", "INDISPONIBILA_TEMPORAR", "OCUPATA"] as const;
  if (!validStatuses.includes(status as StatusCamera)) throw new AppError("Status invalid", "VALIDATION");

  await prisma.camera.update({
    where: { id },
    data: { status: status as StatusCamera, motivIndisponibil: motiv || null },
  });
  await logAudit(user.id, "CAMERA_STATUS", { cameraId: id, status, motiv });
  revalidatePath("/dashboard/camere");
}

export async function createRezervare(formData: FormData) {
  const user = await requireRole("RECEPTIE", "ADMINISTRATIV", "PROGRAMARE");
  const required = validateRequired(formData, "cursantId", "cameraId", "checkIn", "checkOut");

  const checkIn = new Date(required.checkIn);
  const checkOut = new Date(required.checkOut);
  if (checkOut <= checkIn) throw new AppError("Check-Out trebuie să fie după Check-In", "VALIDATION");
  if (checkIn < new Date(new Date().toDateString())) throw new AppError("Check-In nu poate fi în trecut", "VALIDATION");

  const camera = await prisma.camera.findUnique({ where: { id: required.cameraId } });
  if (!camera || camera.status !== "DISPONIBILA") throw new AppError("Camera nu este disponibilă", "CAMERA_BUSY");

  await prisma.$transaction(async (tx) => {
    const rezervare = await tx.rezervare.create({
      data: { cursantId: required.cursantId, cameraId: required.cameraId, checkIn, checkOut, status: "PLATA_ASTEPTARE" },
    });

    await tx.cerereCazare.create({
      data: { rezervareId: rezervare.id, status: "IN_ASTEPTARE" },
    });

    await tx.camera.update({
      where: { id: required.cameraId },
      data: { status: "REZERVATA_PLATA_ASTEPTARE" },
    });
  });

  await logAudit(user.id, "REZERVARE_CREATA", { cameraId: required.cameraId, cursantId: required.cursantId });
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function anuleazaRezervare(id: string) {
  const user = await requireRole("RECEPTIE", "ADMINISTRATIV");
  const rezervare = await prisma.rezervare.findUnique({ where: { id }, select: { cameraId: true, status: true } });
  if (!rezervare) throw new AppError("Rezervarea nu există", "NOT_FOUND");
  if (rezervare.status === "CHECKOUT_EFFECTUAT" || rezervare.status === "ANULATA") throw new AppError("Rezervarea este deja finalizată", "ALREADY_DONE");

  await prisma.$transaction(async (tx) => {
    await tx.rezervare.update({ where: { id }, data: { status: "ANULATA" } });
    await tx.camera.update({ where: { id: rezervare.cameraId }, data: { status: "DISPONIBILA" } });
  });

  await logAudit(user.id, "REZERVARE_ANULATA", { rezervareId: id });
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

// ====== PARCARE ======
export async function createParcare(formData: FormData) {
  await requireRole("ADMINISTRATIV");
  const required = validateRequired(formData, "numarLoc");
  await prisma.parcare.create({ data: { numarLoc: required.numarLoc } });
  revalidatePath("/dashboard/parcare");
}

export async function toggleParcare(id: string, status: string, cameraId?: string) {
  await requireRole("ADMINISTRATIV", "RECEPTIE");
  await prisma.parcare.update({
    where: { id },
    data: { status: status as "LIBER" | "OCUPAT" | "REZERVAT", cameraId: cameraId || null },
  });
  revalidatePath("/dashboard/parcare");
}

export async function deleteParcare(id: string) {
  await requireRole("ADMINISTRATIV");
  await prisma.parcare.delete({ where: { id } });
  revalidatePath("/dashboard/parcare");
}

// ====== OBIECTE PIERDUTE ======
export async function createObiectPierdut(formData: FormData) {
  await requireRole("ADMINISTRATIV", "RECEPTIE");
  const required = validateRequired(formData, "descriere");
  const cameraId = formData.get("cameraId") as string;
  await prisma.obiectPierdut.create({ data: { descriere: required.descriere, cameraId: cameraId || undefined, gasitLa: new Date() } });
  revalidatePath("/dashboard/obiecte-pierdute");
}

export async function restituieObiect(id: string) {
  await requireRole("ADMINISTRATIV", "RECEPTIE");
  await prisma.obiectPierdut.update({ where: { id }, data: { status: "RESTITUIT", predatLa: new Date() } });
  revalidatePath("/dashboard/obiecte-pierdute");
}
