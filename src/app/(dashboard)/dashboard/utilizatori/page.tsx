import { prisma } from "@/lib/prisma";
import { UtilizatoriClient } from "./utilizatori-client";

export default async function UtilizatoriPage() {
  const utilizatori = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLogin: true, createdAt: true },
  });

  return (
    <UtilizatoriClient
      utilizatori={utilizatori.map(u => ({
        id: u.id, email: u.email, name: u.name, role: u.role,
        isActive: u.isActive, lastLogin: u.lastLogin?.toLocaleDateString("ro-RO") || "-", createdAt: u.createdAt.toLocaleDateString("ro-RO"),
      }))}
    />
  );
}
