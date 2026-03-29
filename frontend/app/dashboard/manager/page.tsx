'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { mockUsers } from '@/components/mock/data';
import { AlertCircle, CheckCircle, TrendingUp, Clock } from 'lucide-react';

export default function ManagerDashboard() {
  const { state } = useApp();

  // Get managed employees
  const managedEmployees = mockUsers.filter(u => u.managerId === state.currentUserId);
  const managedExpenses = state.expenses.filter(e =>
    managedEmployees.some(emp => emp.id === e.employeeId)
  );

  const stats = {
    total: managedExpenses.length,
    pending: managedExpenses.filter(e => e.status === 'pending').length,
    approved: managedExpenses.filter(e => e.status === 'approved').length,
    rejected: managedExpenses.filter(e => e.status === 'rejected').length,
    teamMembers: managedEmployees.length,
    totalPendingAmount: managedExpenses
      .filter(e => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0),
  };

  const currentManager = mockUsers.find(u => u.id === state.currentUserId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Welcome, {currentManager?.name}</h1>
        <p className="text-muted-foreground">Manage team expenses and approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalPendingAmount.toFixed(2)} awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">this month</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">direct reports</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">under your team</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pending Approvals</CardTitle>
            <CardDescription>Expenses waiting for your review</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {managedExpenses
                .filter(e => e.status === 'pending')
                .slice(0, 3)
                .map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded">
                    <div>
                      <p className="font-medium">{expense.employeeName}</p>
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                    </div>
                    <p className="font-bold">${expense.amount.toFixed(2)}</p>
                  </div>
                ))}
              {stats.pending > 3 && (
                <p className="text-sm text-muted-foreground pt-2">
                  +{stats.pending - 3} more pending
                </p>
              )}
            </div>
            <Link href="/dashboard/manager/approvals">
              <Button className="w-full mt-4" variant="outline">
                Review All Approvals
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
            <CardDescription>Your direct reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {managedEmployees.map(employee => {
                const empExpenses = managedExpenses.filter(e => e.employeeId === employee.id);
                const pending = empExpenses.filter(e => e.status === 'pending').length;
                return (
                  <div key={employee.id} className="flex items-center justify-between p-3 border border-border rounded">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {empExpenses.length} expenses
                        {pending > 0 && ` (${pending} pending)`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <Link href="/dashboard/manager/approvals">
              <Button className="w-full mt-4" variant="outline">
                View All Team
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Analytics CTA */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Insights</CardTitle>
          <CardDescription>View detailed team spending and approval metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/dashboard/manager/analytics">
            <Button>View Analytics Dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
