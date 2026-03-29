import { Request, Response } from 'express';
import { ApprovalService } from './approvals.service';

const approvalService = new ApprovalService();

export const approvalController = {
  approveExpense: async (req: Request, res: Response) => {
    try {
      // Maps to frontend: dispatch({ type: 'APPROVE_EXPENSE', payload: { expenseId, approverId, comment } })
      const { expenseId } = req.params;
      const { approverId, companyId, comment } = req.body;
      
      const result = await approvalService.processApproval(expenseId, approverId, 'APPROVE', companyId || 'default-company');
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  rejectExpense: async (req: Request, res: Response) => {
    try {
      // Maps to frontend: dispatch({ type: 'REJECT_EXPENSE', payload: { expenseId, approverId, comment } })
      const { expenseId } = req.params;
      const { approverId, companyId, comment } = req.body;
      
      const result = await approvalService.processApproval(expenseId, approverId, 'REJECT', companyId || 'default-company');
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
};
