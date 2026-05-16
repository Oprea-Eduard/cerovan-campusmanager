import { prisma } from "@/lib/prisma";
import { SetariClient } from "./setari-client";

export default async function SetariPage() {
  const tarife = await prisma.tarif.findMany({
    orderBy: [{ tipCamera: "asc" }, { updatedAt: "desc" }],
  });
  const active = tarife.filter(t => t.activ);

  return (
    <SetariClient
      tarife={tarife.map(t => ({
        id: t.id, tipCamera: t.tipCamera === "SINGLE_STANDARD" ? "Standard" : "Apartament",
        valoare: Number(t.valoare), activ: t.activ, updatedAt: t.updatedAt.toLocaleDateString("ro-RO"),
      }))}
      activeStandard={Number(active.find(t => t.tipCamera === "SINGLE_STANDARD")?.valoare || 120)}
      activeApartament={Number(active.find(t => t.tipCamera === "APARTAMENT")?.valoare || 200)}
    />
  );
}
