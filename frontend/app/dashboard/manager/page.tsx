'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import api, { Expense } from '@/lib/api';

export default function ManagerDashboard() {
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);
  const [teamExpenses, setTeamExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);

    const fetchData = async () => {
      if (!userId) return;
      setIsLoading(true);
      try {
        const [pending, allExpenses] = await Promise.all([
          api.getPendingApprovals(userId),
          api.getExpenses()
        ]);
        setPendingApprovals(pending);
        // For now, filter all expenses by managerId if possible or just show overall team
        setTeamExpenses(allExpenses);
      } catch (error) {
        console.error('Failed to fetch manager data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = {
    total: teamExpenses.length,
    pending: pendingApprovals.length,
    approved: teamExpenses.filter(e => e.status.toLowerCase() === 'approved').length,
    rejected: teamExpenses.filter(e => e.status.toLowerCase() === 'rejected').length,
    totalPendingAmount: pendingApprovals.reduce((sum, e) => sum + e.amount, 0),
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading management data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Manager Overview</h1>
        <p className="text-muted-foreground">Real-time team expense management and workflow approvals</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-primary shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              My Pendings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${stats.totalPendingAmount.toFixed(2)} in your queue
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Team Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approved}</div>
            <p className="text-xs text-muted-foreground mt-1">successfully processed</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">historical record</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              In Workflow
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {teamExpenses.filter(e => e.status.toLowerCase() === 'submitted' || e.status.toLowerCase() === 'in_review').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">awaiting resolution</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Immediate Approvals</CardTitle>
            <CardDescription>Directly assigned to you by the state machine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals.length > 0 ? (
                pendingApprovals.slice(0, 3).map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                    <div>
                      <p className="font-semibold">{expense.user?.name || 'Employee'}</p>
                      <p className="text-sm text-muted-foreground">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{expense.currency} {expense.amount.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No pending approvals in your queue
                </div>
              )}
              {stats.pending > 3 && (
                <p className="text-sm text-primary font-medium pt-2">
                   + {stats.pending - 3} more in queue
                </p>
              )}
            </div>
            <Link href="/dashboard/manager/approvals">
              <Button className="w-full mt-4" variant="default" disabled={pendingApprovals.length === 0}>
                Go to Approvals Center
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Team Activity</CardTitle>
            <CardDescription>Latest submission logs from the database</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamExpenses.slice(0, 3).map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{expense.category}</p>
                    <p className="text-xs text-muted-foreground">{new Date(expense.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{expense.currency} {expense.amount.toFixed(2)}</p>
                    <p className="text-[10px] uppercase font-bold text-primary">{expense.status}</p>
                  </div>
                </div>
              ))}
              {teamExpenses.length === 0 && (
                <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  No activity recorded yet
                </div>
              )}
            </div>
            <Link href="/dashboard/manager/analytics">
              <Button className="w-full mt-4" variant="outline">
                View Performance Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

