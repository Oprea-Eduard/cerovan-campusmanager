import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

type Role = "CONDUCERE" | "ADMINISTRATIV" | "RECEPTIE" | "PROGRAMARE" | "CONTABILITATE" | "CAMERISTA";

export class AppError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "AppError";
  }
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new AppError("Neautentificat", "UNAUTHORIZED");
  return session.user as { id: string; email: string; name: string; role: Role };
}

export async function requireRole(...roles: Role[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role)) {
    throw new AppError(`Nu aveți permisiunea necesară (${roles.join(", ")})`, "FORBIDDEN");
  }
  return user;
}

export async function logAudit(userId: string, actiune: string, detalii?: Prisma.InputJsonValue) {
  try {
    await prisma.auditLog.create({ data: { userId, actiune, detalii: detalii || undefined } });
  } catch {
    // silent
  }
}

export function validateRequired(formData: FormData, ...fields: string[]) {
  const result: Record<string, string> = {};
  for (const field of fields) {
    const val = formData.get(field) as string | null;
    if (!val || !val.trim()) throw new AppError(`Câmpul "${field}" este obligatoriu`, "VALIDATION");
    result[field] = val.trim();
  }
  return result;
}

export function validateOptional(formData: FormData, ...fields: string[]) {
  const result: Record<string, string | null> = {};
  for (const field of fields) {
    const val = formData.get(field) as string | null;
    result[field] = val?.trim() || null;
  }
  return result;
}
