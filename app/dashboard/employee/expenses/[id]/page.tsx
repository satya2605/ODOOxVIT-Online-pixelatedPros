'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { ChevronLeft, CheckCircle, Clock, XCircle } from 'lucide-react';

export default function ExpenseDetailPage() {
  const { id } = useParams();
  const { state } = useApp();

  const expense = state.expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/dashboard/employee/expenses">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Expenses
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Expense not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/employee/expenses">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Expenses
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{expense.category}</CardTitle>
                  <CardDescription>{expense.date.toLocaleDateString()}</CardDescription>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
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
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold">
                  ${expense.amount.toFixed(2)} {expense.currency}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{expense.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Receipt Preview */}
          {expense.receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={expense.receiptUrl} alt="Receipt" className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {/* Approval Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expense.approvals.length > 0 ? (
                  expense.approvals.map((approval, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            approval.status === 'approved'
                              ? 'bg-green-500'
                              : approval.status === 'rejected'
                              ? 'bg-red-500'
                              : 'bg-gray-300'
                          }`}
                        >
                          {approval.status === 'approved' ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : approval.status === 'rejected' ? (
                            <XCircle className="w-4 h-4" />
                          ) : (
                            <Clock className="w-4 h-4" />
                          )}
                        </div>
                        {idx < expense.approvals.length - 1 && (
                          <div className="w-0.5 h-12 bg-border my-1" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="font-medium">
                          {approval.approverName} (Step {approval.step})
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {approval.status === 'approved'
                            ? 'Approved'
                            : approval.status === 'rejected'
                            ? 'Rejected'
                            : 'Pending'}
                        </p>
                        {approval.comment && (
                          <p className="text-sm mt-2 p-2 bg-muted rounded">
                            {approval.comment}
                          </p>
                        )}
                        {approval.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {approval.timestamp.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No approvals yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Expense ID</p>
                <p className="text-sm font-mono bg-muted p-2 rounded">{expense.id}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{expense.category}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Amount</p>
                <p className="text-2xl font-bold">${expense.amount.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-sm">{expense.createdAt.toLocaleDateString()}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <p
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    expense.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : expense.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {expense.status.toUpperCase()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
