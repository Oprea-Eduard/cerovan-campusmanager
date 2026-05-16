import { prisma } from "@/lib/prisma";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const camere = await prisma.camera.findMany({
    orderBy: [{ etaj: "asc" }, { numar: "asc" }],
    select: { id: true, numar: true, etaj: true, tip: true },
  });

  const rezervari = await prisma.rezervare.findMany({
    where: {
      status: { in: ["ACHITATA", "CHECKIN_EFFECTUAT", "CHECKOUT_EFFECTUAT", "PLATA_ASTEPTARE"] },
      checkOut: { gte: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1) },
    },
    select: { checkIn: true, checkOut: true, cameraId: true, status: true },
  });

  return (
    <CalendarClient
      camere={camere.map(c => ({ id: c.id, numar: c.numar, etaj: c.etaj, tip: c.tip }))}
      rezervari={rezervari.map(r => ({
        cameraId: r.cameraId,
        checkIn: r.checkIn.toISOString().split("T")[0],
        checkOut: r.checkOut.toISOString().split("T")[0],
        status: r.status,
      }))}
    />
  );
}
