'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Expense } from '@/lib/api';
import { ChevronRight, CheckCircle2, Clock, XCircle, FileText, RefreshCw } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  SUBMITTED: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_ICONS: Record<string, React.ElementType> = {
  APPROVED: CheckCircle2,
  SUBMITTED: Clock,
  IN_REVIEW: Clock,
  REJECTED: XCircle,
  DRAFT: FileText,
};

export default function EmployeeApprovalsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = typeof window !== 'undefined' ? localStorage.getItem('currentUserId') ?? '' : '';

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getExpenses(userId);
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const stats = {
    total: expenses.length,
    awaitingApproval: expenses.filter((e) => e.status === 'SUBMITTED' || e.status === 'IN_REVIEW').length,
    approved: expenses.filter((e) => e.status === 'APPROVED').length,
    rejected: expenses.filter((e) => e.status === 'REJECTED').length,
  };

  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Approval Tracking</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor the approval progress of your expenses</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchExpenses}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Submitted', value: stats.total, color: '' },
          { label: 'Awaiting Approval', value: stats.awaitingApproval, color: 'text-amber-600 border-l-amber-500 border-l-4' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600 border-l-emerald-500 border-l-4' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600 border-l-red-500 border-l-4' },
        ].map((s) => (
          <Card key={s.label} className={s.color}>
            <CardContent className="pt-5">
              <div className={`text-2xl font-bold ${s.color.includes('text-') ? s.color.split(' ')[0] : ''}`}>{s.value}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Your Expenses & Approval Status</CardTitle>
          <CardDescription>Track the status of each submitted expense</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No expenses yet</p>
              <Link href="/dashboard/employee/submit" className="inline-block mt-4">
                <Button variant="outline" size="sm">Submit Your First Expense</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {sorted.map((expense) => {
                const Icon = STATUS_ICONS[expense.status] ?? FileText;
                const color = STATUS_COLORS[expense.status] ?? STATUS_COLORS.DRAFT;
                return (
                  <Link key={expense.id} href={`/dashboard/employee/expenses/${expense.id}`}>
                    <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{expense.category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(expense.date).toLocaleDateString()} · {expense.amount.toLocaleString()} {expense.currency}
                        </p>
                        {expense.description && (
                          <p className="text-xs text-muted-foreground truncate">{expense.description}</p>
                        )}
                      </div>
                      <Badge className={`border text-xs shrink-0 gap-1 ${color}`}>
                        <Icon className="w-3 h-3" />
                        {expense.status.charAt(0) + expense.status.slice(1).toLowerCase().replace('_', ' ')}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Info */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-900">
        <CardHeader>
          <CardTitle className="text-base text-blue-900 dark:text-blue-200">How Approvals Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <p>1. <strong>Submit:</strong> You submit an expense with receipt and details</p>
          <p>2. <strong>Manager Review:</strong> Your manager reviews and approves or rejects</p>
          <p>3. <strong>Multi-Level:</strong> Additional approvers (Finance, CFO) may be in the chain</p>
          <p>4. <strong>Final Status:</strong> Expense is fully Approved or Rejected based on the rules</p>
        </CardContent>
      </Card>
    </div>
  );
}
