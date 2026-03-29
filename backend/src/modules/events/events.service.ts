import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class EventService {
  /**
   * Logs an action in the system for traceability and audit.
   */
  async logEvent(expenseId: string, type: string, actorId: string | null = null, metadata: object = {}) {
    return prisma.event.create({
      data: {
        expenseId,
        type,
        actorId,
        metadata,
      }
    });
  }

  /**
   * Fetch all activity for an expense for the frontend timeline view.
   */
  async getExpenseActivity(expenseId: string) {
    return prisma.event.findMany({
      where: { expenseId },
      orderBy: { timestamp: 'asc' },
      include: {
        actor: {
          select: { id: true, name: true, role: true }
        }
      }
    });
  }
}
