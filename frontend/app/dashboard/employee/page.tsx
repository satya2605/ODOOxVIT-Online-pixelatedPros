'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Clock, CheckCircle, Loader2 } from 'lucide-react';
import { SmartStatusBadge } from '@/components/features/expenses/smart-status-badge';
import api, { Expense } from '@/lib/api';

export default function EmployeeDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);

    const fetchExpenses = async () => {
      try {
        const data = await api.getExpenses();
        // Filter by user if needed (backend should ideally handle this)
        const filtered = userId ? data.filter(e => e.userId === userId) : data;
        setExpenses(filtered);
      } catch (error) {
        console.error('Failed to fetch expenses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  const stats = {
    totalSpent: expenses
      .filter(e => e.status.toLowerCase() === 'approved')
      .reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: expenses
      .filter(e => e.status.toLowerCase() === 'submitted' || e.status.toLowerCase() === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
    approvedCount: expenses.filter(e => e.status.toLowerCase() === 'approved').length,
  };

  const recentExpenses = expenses.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Expenses</h1>
        <p className="text-muted-foreground">Manage and track your expense reimbursements from the live system</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">{stats.approvedCount} approved expenses</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-400 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {expenses.filter(e => e.status.toLowerCase() !== 'approved' && e.status.toLowerCase() !== 'rejected').length} items in workflow
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {expenses.length > 0
                ? Math.round((stats.approvedCount / expenses.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">of total submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Directly from the Node.js backend</CardDescription>
            </div>
            <Link href="/dashboard/employee/submit">
              <Button size="default">Submit New Expense</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Category
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Amount
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map(expense => (
                    <tr
                      key={expense.id}
                      className="border-b border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => window.location.href = `/dashboard/employee/expenses/${expense.id}`}
                    >
                      <td className="py-3 px-4 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{expense.category}</td>
                      <td className="py-3 px-4 text-sm font-medium">
                        {expense.currency} {expense.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <SmartStatusBadge status={expense.status.toLowerCase() as any} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 flex flex-col items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
              <DollarSign className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-muted-foreground mb-4 font-medium">No system records found</p>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Connect your first expense report. The OCR engine will help you process the data instantly.
              </p>
              <Link href="/dashboard/employee/submit">
                <Button>Submit Your First Expense</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
