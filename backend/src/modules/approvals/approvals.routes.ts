import { Router } from 'express';
import { approvalController } from './approvals.controller';

const router = Router();

router.post('/:expenseId/approve', approvalController.approveExpense);
router.post('/:expenseId/reject', approvalController.rejectExpense);

export default router;
