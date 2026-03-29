import { Router } from 'express';
import expensesRoutes from '../modules/expenses/expenses.routes';
import approvalsRoutes from '../modules/approvals/approvals.routes';
import rulesRoutes from '../modules/rules/rules.routes';
import usersRoutes from '../modules/users/users.routes';
import ocrRoutes from '../modules/ocr/ocr.routes';

const router = Router();

// Modular Route implementations mapping to frontend
router.use('/expenses', expensesRoutes);
router.use('/approvals', approvalsRoutes);
router.use('/rules', rulesRoutes);
router.use('/users', usersRoutes);
router.use('/ocr', ocrRoutes);

// System Check
router.get('/health', (req, res) => res.json({ status: 'OK' }));

export default router;
