'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Expense } from '@/lib/api';
import { ChevronLeft, CheckCircle2, Clock, XCircle, RefreshCw, Receipt } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  SUBMITTED: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

export default function ExpenseDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      try {
        const data = await api.getExpenseById(id);
        setExpense(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchExpense();
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center gap-2 text-muted-foreground h-40">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading expense...
      </div>
    );
  }

  if (notFound || !expense) {
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-4">
        <Link href="/dashboard/employee/expenses">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" /> Back to Expenses
          </Button>
        </Link>
        <div className="text-center py-12 text-muted-foreground">
          <XCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Expense not found.</p>
        </div>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[expense.status] ?? STATUS_COLORS.DRAFT;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/employee/expenses">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Expenses
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
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(expense.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Badge className={`border text-sm px-3 py-1 ${statusColor}`}>
                  {expense.status.charAt(0) + expense.status.slice(1).toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Amount</p>
                <p className="text-3xl font-bold">
                  {expense.amount.toLocaleString()} <span className="text-lg font-medium text-muted-foreground">{expense.currency}</span>
                </p>
              </div>
              {expense.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Description</p>
                  <p className="text-foreground">{expense.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Receipt */}
          {expense.receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="w-4 h-4" /> Receipt
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={expense.receiptUrl}
                  alt="Receipt"
                  className="w-full rounded-lg border border-border max-h-96 object-contain"
                />
              </CardContent>
            </Card>
          )}

          {/* Approval Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expense.status === 'SUBMITTED' && (
                  <div className="flex gap-3 items-center">
                    <Clock className="w-5 h-5 text-amber-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Waiting for review</p>
                      <p className="text-xs text-muted-foreground">Your manager will review this expense soon</p>
                    </div>
                  </div>
                )}
                {expense.status === 'IN_REVIEW' && (
                  <div className="flex gap-3 items-center">
                    <Clock className="w-5 h-5 text-blue-500 shrink-0 animate-pulse" />
                    <div>
                      <p className="font-medium text-sm">Currently under review</p>
                      <p className="text-xs text-muted-foreground">An approver is reviewing this expense</p>
                    </div>
                  </div>
                )}
                {expense.status === 'APPROVED' && (
                  <div className="flex gap-3 items-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Expense Approved</p>
                      <p className="text-xs text-muted-foreground">Your expense has been approved</p>
                    </div>
                  </div>
                )}
                {expense.status === 'REJECTED' && (
                  <div className="flex gap-3 items-center">
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Expense Rejected</p>
                      <p className="text-xs text-muted-foreground">This expense was not approved</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Card */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-muted-foreground">Expense ID</p>
                <p className="font-mono bg-muted p-1.5 rounded text-xs break-all mt-1">{expense.id}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium mt-0.5">{expense.category}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount</p>
                <p className="text-xl font-bold mt-0.5">{expense.amount.toLocaleString()} {expense.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Submitted</p>
                <p className="mt-0.5">{new Date(expense.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge className={`border text-xs mt-1 ${statusColor}`}>
                  {expense.status.charAt(0) + expense.status.slice(1).toLowerCase().replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
