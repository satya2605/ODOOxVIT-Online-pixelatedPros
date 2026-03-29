import { Router } from 'express';
import { expenseController } from './expenses.controller';

const router = Router();

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);


export default router;
