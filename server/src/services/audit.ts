import { prisma } from "../config/db";

export async function recordAudit(actorId: string | null, action: string, entityType: string, entityId?: string, details?: string) {
  await prisma.auditLog.create({
    data: { actorId: actorId ?? undefined, action, entityType, entityId, details },
  });
}
