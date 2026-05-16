import { prisma } from "@/lib/prisma";
import { CheckInOutClient } from "./checkinout-client";

export default async function CheckinoutPage() {
  const [rezervariAchitate, camereOcupate, rezervariFinalizate] = await Promise.all([
    prisma.rezervare.findMany({
      where: { status: "ACHITATA" },
      include: {
        cursant: { select: { nume: true, prenume: true } },
        camera: { select: { numar: true, etaj: true } },
      },
      orderBy: { checkIn: "asc" },
    }),
    prisma.rezervare.findMany({
      where: { status: "CHECKIN_EFFECTUAT" },
      include: {
        cursant: { select: { nume: true, prenume: true } },
        camera: { select: { numar: true, etaj: true } },
        checkInOut: { select: { dataCheckin: true } },
      },
      orderBy: { checkIn: "asc" },
    }),
    prisma.rezervare.findMany({
      where: { status: "CHECKOUT_EFFECTUAT" },
      include: {
        cursant: { select: { nume: true, prenume: true } },
        camera: { select: { numar: true } },
        checkInOut: { select: { dataCheckin: true, dataCheckout: true, noteConstatare: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <CheckInOutClient
      pendingCheckin={rezervariAchitate.map(r => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        etaj: r.camera.etaj,
        checkIn: r.checkIn.toLocaleDateString("ro-RO"),
        checkOut: r.checkOut.toLocaleDateString("ro-RO"),
      }))}
      activeCheckin={camereOcupate.map(r => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        etaj: r.camera.etaj,
        checkIn: r.checkIn.toLocaleDateString("ro-RO"),
        checkOut: r.checkOut.toLocaleDateString("ro-RO"),
        dataCheckin: r.checkInOut?.dataCheckin?.toLocaleDateString("ro-RO") || "-",
      }))}
      recentCheckout={rezervariFinalizate.map(r => ({
        id: r.id,
        cursant: `${r.cursant.nume} ${r.cursant.prenume}`,
        camera: r.camera.numar,
        etaj: 0,
        checkIn: r.checkIn.toLocaleDateString("ro-RO"),
        checkOut: r.checkOut.toLocaleDateString("ro-RO"),
        dataCheckin: r.checkInOut?.dataCheckin?.toLocaleDateString("ro-RO") || "-",
        dataCheckout: r.checkInOut?.dataCheckout?.toLocaleDateString("ro-RO") || "-",
        areNote: (r.checkInOut?.noteConstatare?.length || 0) > 0,
      }))}
    />
  );
}
