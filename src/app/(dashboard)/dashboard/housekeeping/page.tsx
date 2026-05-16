import { prisma } from "@/lib/prisma";
import { HousekeepingList } from "./housekeeping-list";

export default async function HousekeepingPage() {
  const camere = await prisma.camera.findMany({
    orderBy: [{ etaj: "asc" }, { numar: "asc" }],
    include: {
      housekeeping: {
        orderBy: { asignatLa: "desc" },
        take: 1,
      },
    },
  });

  const housekeepingStats = {
    murdar: camere.filter(c => c.housekeeping[0]?.status === "MURDAR" || !c.housekeeping.length).length,
    inLucru: camere.filter(c => c.housekeeping[0]?.status === "IN_LUCRU").length,
    curat: camere.filter(c => c.housekeeping[0]?.status === "CURAT").length,
    verificat: camere.filter(c => c.housekeeping[0]?.status === "VERIFICAT").length,
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Housekeeping</h1>
        <p className="text-muted-foreground">Gestionare curățenie camere</p>
      </div>
      <HousekeepingList
        stats={housekeepingStats}
        camere={camere.map(c => ({
          id: c.id,
          numar: c.numar,
          etaj: c.etaj,
          statusCuratenie: c.housekeeping[0]?.status || "MURDAR",
        }))}
      />
    </div>
  );
}
