'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { ChevronRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function EmployeeExpensesPage() {
  const { state } = useApp();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const employeeExpenses = state.expenses
    .filter(e => e.employeeId === state.currentUserId)
    .filter(e => statusFilter === 'all' || e.status === statusFilter)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  const stats = {
    total: state.expenses.filter(e => e.employeeId === state.currentUserId).length,
    pending: state.expenses.filter(e => e.employeeId === state.currentUserId && e.status === 'pending').length,
    approved: state.expenses.filter(e => e.employeeId === state.currentUserId && e.status === 'approved').length,
    rejected: state.expenses.filter(e => e.employeeId === state.currentUserId && e.status === 'rejected').length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Expenses</h1>
          <p className="text-muted-foreground">View and manage all your submitted expenses</p>
        </div>
        <Link href="/dashboard/employee/submit">
          <Button>Submit New Expense</Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 md:grid-cols-4">
        <Card className={statusFilter === 'all' ? 'border-primary border-2' : 'cursor-pointer hover:border-primary/50'} onClick={() => setStatusFilter('all')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
          </CardContent>
        </Card>
        <Card className={statusFilter === 'pending' ? 'border-primary border-2' : 'cursor-pointer hover:border-primary/50'} onClick={() => setStatusFilter('pending')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className={statusFilter === 'approved' ? 'border-primary border-2' : 'cursor-pointer hover:border-primary/50'} onClick={() => setStatusFilter('approved')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card className={statusFilter === 'rejected' ? 'border-primary border-2' : 'cursor-pointer hover:border-primary/50'} onClick={() => setStatusFilter('rejected')}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.rejected}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Expenses List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Expense List</CardTitle>
              <CardDescription>All your submitted expense reports</CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {employeeExpenses.length > 0 ? (
            <div className="space-y-2">
              {employeeExpenses.map(expense => (
                <Link key={expense.id} href={`/dashboard/employee/expenses/${expense.id}`}>
                  <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex-1">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">{expense.category}</p>
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${expense.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{expense.date.toLocaleDateString()}</p>
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
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No expenses found</p>
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
