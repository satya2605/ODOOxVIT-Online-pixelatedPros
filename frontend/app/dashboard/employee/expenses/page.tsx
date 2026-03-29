'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Expense } from '@/lib/api';
import { ChevronRight, FileText, RefreshCw, PlusCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
  SUBMITTED: 'bg-amber-100 text-amber-700 border-amber-200',
  IN_REVIEW: 'bg-blue-100 text-blue-700 border-blue-200',
  APPROVED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  REJECTED: 'bg-red-100 text-red-600 border-red-200',
};

export default function EmployeeExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

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

  const filtered = expenses.filter(
    (e) => statusFilter === 'all' || e.status === statusFilter
  );

  const stats = {
    total: expenses.length,
    draft: expenses.filter((e) => e.status === 'DRAFT').length,
    pending: expenses.filter((e) => e.status === 'SUBMITTED' || e.status === 'IN_REVIEW').length,
    approved: expenses.filter((e) => e.status === 'APPROVED').length,
    rejected: expenses.filter((e) => e.status === 'REJECTED').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> My Expenses
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage your expense submissions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchExpenses}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Link href="/dashboard/employee/submit">
            <Button size="sm" className="gap-1.5">
              <PlusCircle className="w-4 h-4" /> Submit Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats - clickable filters */}
      <div className="grid gap-3 md:grid-cols-5">
        {[
          { key: 'all', label: 'Total', value: stats.total },
          { key: 'DRAFT', label: 'Draft', value: stats.draft },
          { key: 'SUBMITTED', label: 'Pending', value: stats.pending },
          { key: 'APPROVED', label: 'Approved', value: stats.approved },
          { key: 'REJECTED', label: 'Rejected', value: stats.rejected },
        ].map((s) => (
          <Card
            key={s.key}
            className={`cursor-pointer transition-all hover:shadow-md ${statusFilter === s.key ? 'ring-2 ring-primary border-primary' : 'hover:border-primary/40'}`}
            onClick={() => setStatusFilter(s.key)}
          >
            <CardContent className="pt-4 pb-4">
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Expense History</CardTitle>
              <CardDescription>{filtered.length} expenses shown</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="IN_REVIEW">In Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading expenses...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No expenses found</p>
              <p className="text-sm text-muted-foreground mt-1">Submit an expense to get started</p>
              <Link href="/dashboard/employee/submit" className="inline-block mt-4">
                <Button variant="outline" size="sm">Submit Your First Expense</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((expense) => (
                <Link key={expense.id} href={`/dashboard/employee/expenses/${expense.id}`}>
                  <div className="flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors group">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{expense.category}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{expense.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">{expense.amount.toLocaleString()} {expense.currency}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                    <Badge className={`border text-xs shrink-0 ${STATUS_COLORS[expense.status] ?? STATUS_COLORS.DRAFT}`}>
                      {expense.status.charAt(0) + expense.status.slice(1).toLowerCase().replace('_', ' ')}
                    </Badge>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
