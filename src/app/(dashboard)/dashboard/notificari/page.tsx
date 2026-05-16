import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/security";
import { NotificariClient } from "./notificari-client";

export default async function NotificariPage() {
  const user = await requireAuth();
  const notificari = await prisma.notificare.findMany({
    where: { OR: [{ destinatarId: user.id }, { destinatarId: null }] },
    orderBy: [{ citita: "asc" }, { createdAt: "desc" }],
    take: 50,
  });

  return (
    <NotificariClient
      notificari={notificari.map(n => ({
        id: n.id, titlu: n.titlu, mesaj: n.mesaj, tip: n.tip,
        citita: n.citita, createdAt: n.createdAt.toLocaleDateString("ro-RO"),
        prioritate: prioritateLabel(n.prioritate),
      }))}
      stat={{
        total: notificari.length,
        necitite: notificari.filter(n => !n.citita).length,
      }}
    />
  );
}

function prioritateLabel(p: string) {
  const map: Record<string, string> = { CRITICA: "Critică", RIDICATA: "Ridicată", NORMALA: "Normală", SCAZUTA: "Scăzută" };
  return map[p] || p;
}
