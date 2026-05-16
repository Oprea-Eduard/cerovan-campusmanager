"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function efectueazaCheckIn(rezervareId: string) {
  const rezervare = await prisma.rezervare.findUnique({
    where: { id: rezervareId },
    include: { camera: true },
  });

  if (!rezervare) throw new Error("Rezervarea nu există");

  await prisma.$transaction(async (tx) => {
    await tx.checkInOut.create({
      data: {
        rezervareId,
        dataCheckin: new Date(),
        receptionerCheckinId: "system",
        regulamentAcceptat: true,
      },
    });

    await tx.rezervare.update({
      where: { id: rezervareId },
      data: { status: "CHECKIN_EFFECTUAT" },
    });

    await tx.camera.update({
      where: { id: rezervare.cameraId },
      data: { status: "OCUPATA" },
    });

    await tx.cheie.update({
      where: { cameraId: rezervare.cameraId },
      data: { status: "PREDATA_CURSANT" },
    });

    await tx.istoricCheie.create({
      data: {
        cheieId: (await tx.cheie.findUnique({ where: { cameraId: rezervare.cameraId } }))!.id,
        actiune: "PREDAT",
        userId: "system",
        observatii: "Check-In efectuat",
      },
    });
  });

  revalidatePath("/dashboard/checkinout");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function efectueazaCheckOut(rezervareId: string, stareCamera?: string, daune?: string, costDaune?: number) {
  const checkInOut = await prisma.checkInOut.findUnique({
    where: { rezervareId },
    include: { rezervare: { include: { camera: true } } },
  });

  if (!checkInOut) throw new Error("Check-In-ul nu există");

  await prisma.$transaction(async (tx) => {
    await tx.checkInOut.update({
      where: { rezervareId },
      data: {
        dataCheckout: new Date(),
        receptionerCheckoutId: "system",
        cheiePrimita: true,
        stareCameraPreCheckout: stareCamera || "",
      },
    });

    if (daune) {
      await tx.notaConstatare.create({
        data: {
          checkInOutId: checkInOut.id,
          descriere: daune,
          costEstimat: costDaune || 0,
          poze: [],
        },
      });
    }

    await tx.rezervare.update({
      where: { id: rezervareId },
      data: { status: "CHECKOUT_EFFECTUAT" },
    });

    await tx.camera.update({
      where: { id: checkInOut.rezervare.cameraId },
      data: { status: "DISPONIBILA" },
    });

    await tx.cheie.update({
      where: { cameraId: checkInOut.rezervare.cameraId },
      data: { status: "LA_RECEPTIE" },
    });

    await tx.istoricCheie.create({
      data: {
        cheieId: (await tx.cheie.findUnique({ where: { cameraId: checkInOut.rezervare.cameraId } }))!.id,
        actiune: "PRIMIT",
        userId: "system",
        observatii: "Check-Out efectuat",
      },
    });

    await tx.housekeeping.create({
      data: {
        cameraId: checkInOut.rezervare.cameraId,
        status: "MURDAR",
      },
    });
  });

  revalidatePath("/dashboard/checkinout");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
  revalidatePath("/dashboard/housekeeping");
}

export async function confirmPlata(plataId: string) {
  await prisma.$transaction(async (tx) => {
    const plata = await tx.plata.update({
      where: { id: plataId },
      data: { status: "CONFIRMATA", dataConfirmare: new Date() },
      include: { rezervare: { include: { camera: true } } },
    });

    const allPlatite = await tx.plata.findMany({
      where: { rezervareId: plata.rezervareId, status: "CONFIRMATA" },
    });

    if (allPlatite.length > 0) {
      await tx.rezervare.update({
        where: { id: plata.rezervareId },
        data: { status: "ACHITATA" },
      });
      await tx.camera.update({
        where: { id: plata.rezervare.cameraId },
        data: { status: "REZERVATA_SI_ACHITATA" },
      });
    }
  });

  revalidatePath("/dashboard/plati");
  revalidatePath("/dashboard/rezervari");
  revalidatePath("/dashboard/camere");
}

export async function adaugaPlata(rezervareId: string, suma: number, metoda: string) {
  await prisma.plata.create({
    data: {
      rezervareId,
      suma,
      metoda: metoda as "ORDIN_PLATA" | "TRANSFER_BANCAR" | "CASIERIE" | "ALTUL",
      status: "NECONFIRMATA",
      dataPlata: new Date(),
    },
  });
  revalidatePath("/dashboard/plati");
  revalidatePath("/dashboard/rezervari");
}

export async function genereazaNotaPlata(rezervareId: string) {
  const rezervare = await prisma.rezervare.findUnique({
    where: { id: rezervareId },
    include: { cursant: true, camera: true, plati: true },
  });

  if (!rezervare) throw new Error("Rezervarea nu există");

  const nopti = Math.ceil((rezervare.checkOut.getTime() - rezervare.checkIn.getTime()) / (1000 * 60 * 60 * 24));
  const tarif = rezervare.camera.tip === "APARTAMENT" ? 200 : 120;
  const total = nopti * tarif;

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
