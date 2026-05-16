"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAuth, requireRole, AppError, logAudit } from "@/lib/security";

async function notifica(titlu: string, mesaj: string, tip: string, destinatarId?: string) {
  try {
    await prisma.notificare.create({
      data: { titlu, mesaj, tip: tip as "PLATA_SCADENTA" | "CHECKIN_ASTEPTARE" | "CERERE_NOUA" | "CAZARE_FINALIZATA" | "SISTEM", destinatarId: destinatarId || undefined },
    });
  } catch { /* silent */ }
}

export async function efectueazaCheckIn(rezervareId: string) {
  const user = await requireRole("RECEPTIE", "ADMINISTRATIV");
  const rezervare = await prisma.rezervare.findUnique({
    where: { id: rezervareId },
    include: { camera: true },
  });
  if (!rezervare) throw new AppError("Rezervarea nu există", "NOT_FOUND");

  const camera = rezervare.camera;
  if (camera.status !== "REZERVATA_SI_ACHITATA") {
    throw new AppError("Camera nu poate fi ocupată — rezervarea nu este achitată.", "NOT_PAID");
  }
  if (rezervare.checkIn > new Date()) {
    throw new AppError("Perioada de cazare nu a început încă. Check-In permis începând cu " + rezervare.checkIn.toLocaleDateString("ro-RO"), "TOO_EARLY");
  }

  await prisma.$transaction(async (tx) => {
    await tx.checkInOut.create({
      data: { rezervareId, dataCheckin: new Date(), receptionerCheckinId: user.id, regulamentAcceptat: true, cheiePredata: true },
    });
    await tx.rezervare.update({ where: { id: rezervareId }, data: { status: "CHECKIN_EFFECTUAT" } });
    await tx.camera.update({ where: { id: camera.id }, data: { status: "OCUPATA" } });

    const cheie = await tx.cheie.findUnique({ where: { cameraId: camera.id } });
    if (cheie) {
      await tx.cheie.update({ where: { cameraId: camera.id }, data: { status: "PREDATA_CURSANT" } });
      await tx.istoricCheie.create({ data: { cheieId: cheie.id, actiune: "PREDAT", userId: user.id, observatii: "Check-In efectuat" } });
    }

    const hk = await tx.housekeeping.findFirst({ where: { cameraId: camera.id, status: { in: ["MURDAR", "IN_LUCRU"] } } });
    if (!hk) await tx.housekeeping.create({ data: { cameraId: camera.id, status: "MURDAR" } });
  });

  await logAudit(user.id, "CHECKIN", { rezervareId, camera: camera.numar });
  await notifica("Check-In efectuat", `Camera ${camera.numar} — rezervare ${rezervareId.slice(0, 8)}`, "CHECKIN_ASTEPTARE");
  revalidatePath("/dashboard/checkinout");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
  revalidatePath("/dashboard/housekeeping");
}

export async function efectueazaCheckOut(rezervareId: string, stareCamera?: string, daune?: string, costDaune?: number) {
  const user = await requireRole("RECEPTIE", "ADMINISTRATIV");
  const checkInOut = await prisma.checkInOut.findUnique({
    where: { rezervareId },
    include: { rezervare: { include: { camera: true } } },
  });
  if (!checkInOut) throw new AppError("Check-In-ul nu există", "NOT_FOUND");

  await prisma.$transaction(async (tx) => {
    await tx.checkInOut.update({
      where: { rezervareId },
      data: { dataCheckout: new Date(), receptionerCheckoutId: user.id, cheiePrimita: true, stareCameraPreCheckout: stareCamera || "" },
    });

    if (daune) {
      await tx.notaConstatare.create({
        data: { checkInOutId: checkInOut.id, descriere: daune, costEstimat: costDaune || 0, poze: [] },
      });
    }

    await tx.rezervare.update({ where: { id: rezervareId }, data: { status: "CHECKOUT_EFFECTUAT" } });
    await tx.camera.update({ where: { id: checkInOut.rezervare.cameraId }, data: { status: "DISPONIBILA" } });

    const cheie = await tx.cheie.findUnique({ where: { cameraId: checkInOut.rezervare.cameraId } });
    if (cheie) {
      await tx.cheie.update({ where: { cameraId: checkInOut.rezervare.cameraId }, data: { status: "LA_RECEPTIE" } });
      await tx.istoricCheie.create({ data: { cheieId: cheie.id, actiune: "PRIMIT", userId: user.id, observatii: "Check-Out efectuat" } });
    }

    await tx.housekeeping.create({ data: { cameraId: checkInOut.rezervare.cameraId, status: "MURDAR" } });
  });

  await logAudit(user.id, "CHECKOUT", { rezervareId, daune: !!daune, cost: costDaune });
  await notifica("Check-Out efectuat", `Camera eliberată ${daune ? "(cu daune)" : ""}`, "CAZARE_FINALIZATA");
  revalidatePath("/dashboard/checkinout");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
  revalidatePath("/dashboard/housekeeping");
}

export async function updateHousekeepingStatus(cameraId: string, status: string) {
  const user = await requireAuth();
  if (!["MURDAR", "IN_LUCRU", "CURAT", "VERIFICAT"].includes(status)) throw new AppError("Status invalid", "VALIDATION");

  const existing = await prisma.housekeeping.findFirst({
    where: { cameraId, status: { in: ["MURDAR", "IN_LUCRU", "CURAT"] } },
  });

  if (existing) {
    await prisma.housekeeping.update({
      where: { id: existing.id },
      data: { status: status as "MURDAR" | "IN_LUCRU" | "CURAT" | "VERIFICAT", cameristaId: user.id, completatLa: status === "CURAT" ? new Date() : null },
    });
  } else {
    await prisma.housekeeping.create({
      data: { cameraId, status: status as "MURDAR" | "IN_LUCRU" | "CURAT" | "VERIFICAT", cameristaId: user.id, completatLa: status === "CURAT" ? new Date() : null },
    });
  }

  revalidatePath("/dashboard/housekeeping");
}

export async function confirmPlata(plataId: string) {
  const user = await requireRole("CONTABILITATE", "ADMINISTRATIV", "CONDUCERE");

  await prisma.$transaction(async (tx) => {
    const plata = await tx.plata.update({
      where: { id: plataId },
      data: { status: "CONFIRMATA", dataConfirmare: new Date() },
      include: { rezervare: { include: { camera: true } } },
    });

    const platit = await tx.plata.aggregate({
      where: { rezervareId: plata.rezervareId, status: "CONFIRMATA" },
      _sum: { suma: true },
    });

    if (Number(platit._sum.suma) > 0) {
      await tx.rezervare.update({ where: { id: plata.rezervareId }, data: { status: "ACHITATA" } });
      await tx.camera.update({ where: { id: plata.rezervare.cameraId }, data: { status: "REZERVATA_SI_ACHITATA" } });
    }
  });

  await logAudit(user.id, "PLATA_CONFIRMATA", { plataId });
  await notifica("Plată confirmată", `Plată confirmată pentru rezervarea în curs`, "PLATA_SCADENTA");
  revalidatePath("/dashboard/plati");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function adaugaPlata(rezervareId: string, suma: number, metoda: string) {
  const user = await requireRole("CONTABILITATE", "ADMINISTRATIV");
  if (suma <= 0) throw new AppError("Suma trebuie să fie mai mare decât 0", "VALIDATION");
  if (!["ORDIN_PLATA", "TRANSFER_BANCAR", "CASIERIE", "ALTUL"].includes(metoda)) throw new AppError("Metoda de plată invalidă", "VALIDATION");

  await prisma.plata.create({
    data: { rezervareId, suma, metoda: metoda as "ORDIN_PLATA" | "TRANSFER_BANCAR" | "CASIERIE" | "ALTUL", status: "NECONFIRMATA", dataPlata: new Date() },
  });

  await logAudit(user.id, "PLATA_ADUGATA", { rezervareId, suma });
  revalidatePath("/dashboard/plati");
  revalidatePath("/dashboard/rezervari");
}

export async function genereazaNotaPlata(rezervareId: string) {
  const user = await requireAuth();
  const rezervare = await prisma.rezervare.findUnique({
    where: { id: rezervareId },
    include: { cursant: true, camera: true },
  });
  if (!rezervare) throw new AppError("Rezervarea nu există", "NOT_FOUND");

  const nopti = Math.ceil((rezervare.checkOut.getTime() - rezervare.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const tarifRec = await prisma.tarif.findFirst({ where: { tipCamera: rezervare.camera.tip, activ: true } });
  const tarif = tarifRec ? Number(tarifRec.valoare) : (rezervare.camera.tip === "APARTAMENT" ? 200 : 120);
  const total = nopti * tarif;

  await logAudit(user.id, "NOTA_PLATA_GENERATA", { rezervareId, total });

  return {
    nr: `NP-${rezervare.id.slice(0, 8).toUpperCase()}`,
    cursant: `${rezervare.cursant.nume} ${rezervare.cursant.prenume}`,
    camera: rezervare.camera.numar,
    tipCamera: rezervare.camera.tip === "APARTAMENT" ? "Apartament" : "Standard",
    checkIn: rezervare.checkIn.toLocaleDateString("ro-RO"),
    checkOut: rezervare.checkOut.toLocaleDateString("ro-RO"),
    nopti,
    tarif,
    total,
  };
}

export async function createNotificare(titlu: string, mesaj: string, tip: string, destinatarId?: string) {
  await requireRole("ADMINISTRATIV", "CONDUCERE");
  await prisma.notificare.create({
    data: { titlu, mesaj, tip: tip as "PLATA_SCADENTA" | "CHECKIN_ASTEPTARE" | "CERERE_NOUA" | "CAZARE_FINALIZATA" | "SISTEM", destinatarId: destinatarId || undefined },
  });
  revalidatePath("/dashboard/notificari");
}

export async function citesteNotificare(id: string) {
  await prisma.notificare.update({ where: { id }, data: { citita: true } });
  revalidatePath("/dashboard/notificari");
}

export async function updateTarif(tipCamera: string, valoare: number) {
  const user = await requireRole("CONDUCERE", "ADMINISTRATIV");
  if (!["SINGLE_STANDARD", "APARTAMENT"].includes(tipCamera)) throw new AppError("Tip cameră invalid", "VALIDATION");
  if (valoare <= 0) throw new AppError("Valoarea trebuie să fie mai mare decât 0", "VALIDATION");

  await prisma.$transaction(async (tx) => {
    await tx.tarif.updateMany({ where: { tipCamera: tipCamera as "SINGLE_STANDARD" | "APARTAMENT", activ: true }, data: { activ: false } });
    await tx.tarif.create({ data: { tipCamera: tipCamera as "SINGLE_STANDARD" | "APARTAMENT", valoare, updatedBy: user.id } });
  });

  await logAudit(user.id, "TARIF_UPDAT", { tipCamera, valoare });
  revalidatePath("/dashboard/setari");
}

export async function createUser(formData: FormData) {
  const user = await requireRole("CONDUCERE");
  const required = validateRequiredRaw(formData, "email", "name", "password", "role");
  const hash = await import("bcryptjs").then(m => m.hash(required.password, 12));

  await prisma.user.create({
    data: { email: required.email, name: required.name, password: hash, role: required.role as "CONDUCERE" | "ADMINISTRATIV" | "RECEPTIE" | "PROGRAMARE" | "CONTABILITATE" | "CAMERISTA" },
  });
  await logAudit(user.id, "USER_CREAT", { email: required.email, role: required.role });
  revalidatePath("/dashboard/utilizatori");
}

export async function toggleUserActiv(id: string, activ: boolean) {
  const user = await requireRole("CONDUCERE");
  await prisma.user.update({ where: { id }, data: { isActive: activ } });
  await logAudit(user.id, `USER_${activ ? "ACTIVAT" : "DEZACTIVAT"}`, { userId: id });
  revalidatePath("/dashboard/utilizatori");
}

function validateRequiredRaw(formData: FormData, ...fields: string[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const val = formData.get(field) as string | null;
    if (!val || !val.trim()) throw new AppError(`Câmpul "${field}" este obligatoriu`, "VALIDATION");
    result[field] = val.trim();
  }
  return result;
}
