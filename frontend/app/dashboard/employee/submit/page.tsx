'use client';

import { ExpenseForm } from '@/components/features/expenses/expense-form';

export default function SubmitExpensePage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Submit New Expense</h1>
        <p className="text-muted-foreground">Add a new expense for reimbursement</p>
      </div>

      <ExpenseForm />
    </div>
  );
}
