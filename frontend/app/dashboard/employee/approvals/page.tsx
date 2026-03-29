'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { ChevronRight, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function EmployeeApprovalsPage() {
  const { state } = useApp();

  const employeeExpenses = state.expenses.filter(e => e.employeeId === state.currentUserId);

  const getApprovalStatus = (expense: any) => {
    const pending = expense.approvals.filter((a: any) => a.status === 'pending');
    const approved = expense.approvals.filter((a: any) => a.status === 'approved');
    const rejected = expense.approvals.filter((a: any) => a.status === 'rejected');

    return { pending, approved, rejected };
  };

  const stats = {
    total: employeeExpenses.length,
    awaitingApproval: employeeExpenses.filter(e => e.status === 'pending').length,
    approved: employeeExpenses.filter(e => e.status === 'approved').length,
    rejected: employeeExpenses.filter(e => e.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Approval Tracking</h1>
        <p className="text-muted-foreground">Monitor the approval status of your expenses</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Submitted</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{stats.awaitingApproval}</div>
            <p className="text-sm text-muted-foreground">Awaiting Approval</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses with Approval Status */}
      <Card>
        <CardHeader>
          <CardTitle>Your Expenses & Approvals</CardTitle>
          <CardDescription>
            Track the approval progress of each expense
          </CardDescription>
        </CardHeader>
        <CardContent>
          {employeeExpenses.length > 0 ? (
            <div className="space-y-3">
              {employeeExpenses
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(expense => {
                  const { pending, approved, rejected } = getApprovalStatus(expense);
                  return (
                    <Link key={expense.id} href={`/dashboard/employee/expenses/${expense.id}`}>
                      <div className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="font-medium">{expense.category}</p>
                            <p className="text-sm text-muted-foreground">
                              {expense.date.toLocaleDateString()} • ${expense.amount.toFixed(2)}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                              expense.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : expense.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                          </span>
                        </div>

                        {/* Approval Steps */}
                        <div className="flex items-center gap-2 text-sm">
                          {expense.approvals.map((approval, idx) => (
                            <div key={idx} className="flex items-center gap-1">
                              {approval.status === 'approved' ? (
                                <>
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-xs text-muted-foreground">
                                    {approval.approverName}
                                  </span>
                                </>
                              ) : approval.status === 'rejected' ? (
                                <>
                                  <XCircle className="w-4 h-4 text-red-500" />
                                  <span className="text-xs text-muted-foreground">
                                    {approval.approverName}
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-4 h-4 text-yellow-500" />
                                  <span className="text-xs text-muted-foreground">
                                    Pending
                                  </span>
                                </>
                              )}
                              {idx < expense.approvals.length - 1 && (
                                <div className="mx-1 w-0.5 h-3 bg-border" />
                              )}
                            </div>
                          ))}
                          <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No expenses submitted yet</p>
              <Link href="/dashboard/employee/submit">
                <Button variant="outline">Submit Your First Expense</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Approval Workflow</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            1. <strong>Submit:</strong> You submit an expense with receipt and details
          </p>
          <p>
            2. <strong>Manager Review:</strong> Your manager reviews and approves/rejects
          </p>
          <p>
            3. <strong>Finance Review:</strong> Finance team verifies the expense
          </p>
          <p>
            4. <strong>Approved:</strong> Expense is approved and reimbursement is processed
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
