import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const expenseController = {
  createExpense: async (req: Request, res: Response) => {
    try {
      // Matches the SUBMIT_EXPENSE frontend action
      const { amount, currency, category, description, userId } = req.body;
      const expense = await prisma.expense.create({
        data: {
          amount,
          currency,
          category,
          description,
          userId,
          date: new Date(),
          status: 'SUBMITTED',
        },
      });

      // Simulating initial default approval step creation
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.managerId) {
        await prisma.approvalStep.create({
          data: {
            expenseId: expense.id,
            approverId: user.managerId,
            stepOrder: 1,
            status: 'PENDING',
          }
        });
      }

      res.status(201).json(expense);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  getExpenses: async (req: Request, res: Response) => {
    try {
      const expenses = await prisma.expense.findMany({
        include: { approvalSteps: true },
      });
      res.json(expenses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
};
