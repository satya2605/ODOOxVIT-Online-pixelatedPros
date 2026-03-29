'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { mockUsers } from '@/components/mock/data';
import { DollarSign, Clock, CheckCircle } from 'lucide-react';

export default function EmployeeDashboard() {
  const { state } = useApp();

  const employeeExpenses = state.expenses.filter(e => e.employeeId === state.currentUserId);
  const currentUser = mockUsers.find(u => u.id === state.currentUserId);

  const stats = {
    totalSpent: employeeExpenses
      .filter(e => e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: employeeExpenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
    approvedCount: employeeExpenses.filter(e => e.status === 'approved').length,
  };

  const recentExpenses = employeeExpenses.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome back, {currentUser?.name}</h1>
        <p className="text-muted-foreground">Manage and track your expense reimbursements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-l-4 border-l-primary">
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

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {employeeExpenses.filter(e => e.status === 'pending').length} pending
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approval Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {employeeExpenses.length > 0
                ? Math.round((stats.approvedCount / employeeExpenses.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">of submitted expenses</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Expenses */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your latest submitted expense reports</CardDescription>
            </div>
            <Link href="/dashboard/employee/submit">
              <Button>Submit New Expense</Button>
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
                      <td className="py-3 px-4 text-sm">{expense.date.toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-sm">{expense.category}</td>
                      <td className="py-3 px-4 text-sm font-medium">${expense.amount.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            expense.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : expense.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No expenses yet</p>
              <Link href="/dashboard/employee/submit">
                <Button variant="outline">Submit Your First Expense</Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
