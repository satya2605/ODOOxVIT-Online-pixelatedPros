import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ruleController = {
  createRule: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'CREATE_RULE', payload: rule })
      const { companyId, type, conditionJson, priority } = req.body;
      const rule = await prisma.rule.create({
        data: {
          companyId: companyId || 'default-company',
          type,
          conditionJson,
          priority: priority || 0
        }
      });
      res.status(201).json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  updateRule: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'UPDATE_RULE', payload: rule })
      const { id } = req.params;
      const { type, conditionJson, priority } = req.body;
      const rule = await prisma.rule.update({
        where: { id },
        data: { type, conditionJson, priority }
      });
      res.json(rule);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  deleteRule: async (req: Request, res: Response) => {
    try {
      // Maps to frontend dispatch({ type: 'DELETE_RULE', payload: id })
      const { id } = req.params;
      await prisma.rule.delete({ where: { id } });
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  getRules: async (req: Request, res: Response) => {
    try {
      const { companyId } = req.query;
      const rules = await prisma.rule.findMany({
        where: companyId ? { companyId: String(companyId) } : undefined
      });
      res.json(rules);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
