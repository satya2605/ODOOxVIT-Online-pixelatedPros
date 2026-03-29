'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, ClipboardCheck, Clock, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

interface ApprovalItem {
  id: string;
  amount: number;
  currency: string;
  category: string;
  description: string;
  date: string;
  status: string;
  user?: { name: string; email: string };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SUBMITTED: { label: 'Pending', color: 'bg-amber-500/10 text-amber-600 border-amber-200', icon: Clock },
  IN_REVIEW: { label: 'In Review', color: 'bg-blue-500/10 text-blue-600 border-blue-200', icon: ClipboardCheck },
  APPROVED: { label: 'Approved', color: 'bg-emerald-500/10 text-emerald-600 border-emerald-200', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/10 text-red-500 border-red-200', icon: XCircle },
};

export default function ManagerApprovalsPage() {
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState('USD');

  const approverId = typeof window !== 'undefined' ? localStorage.getItem('currentUserId') ?? '' : '';

  useEffect(() => {
    const c = localStorage.getItem('companyCurrency') ?? 'USD';
    setCurrency(c);
  }, []);

  const fetchApprovals = useCallback(async () => {
    if (!approverId) return;
    setLoading(true);
    try {
      const data = await api.getPendingApprovals(approverId);
      setApprovals(data);
    } catch {
      setApprovals([]);
    } finally {
      setLoading(false);
    }
  }, [approverId]);

  useEffect(() => { fetchApprovals(); }, [fetchApprovals]);

  const pending = approvals.filter((e) => e.status === 'SUBMITTED' || e.status === 'IN_REVIEW');
  const approved = approvals.filter((e) => e.status === 'APPROVED');
  const rejected = approvals.filter((e) => e.status === 'REJECTED');

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-6 h-6 text-primary" />
            Team Approvals
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review and action team expense requests · amounts shown in <strong>{currency}</strong>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchApprovals}>
          <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: 'Pending Review', value: pending.length, color: 'text-amber-600', icon: Clock },
          { label: 'Approved', value: approved.length, color: 'text-emerald-600', icon: CheckCircle2 },
          { label: 'Rejected', value: rejected.length, color: 'text-red-500', icon: XCircle },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-5 flex items-center gap-3">
              <s.icon className={`w-8 h-8 ${s.color} opacity-80`} />
              <div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Pending Approvals</CardTitle>
              <CardDescription>Expense requests waiting for your action</CardDescription>
            </div>
            {pending.length > 0 && (
              <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                {pending.length} waiting
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-12 gap-2 text-muted-foreground">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading approvals...
            </div>
          ) : pending.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 text-emerald-400 opacity-50" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No pending approvals at the moment</p>
            </div>
          ) : (
            <div className="divide-y">
              {pending.map((expense) => {
                const cfg = STATUS_CONFIG[expense.status] ?? STATUS_CONFIG.SUBMITTED;
                const Icon = cfg.icon;
                return (
                  <Link
                    key={expense.id}
                    href={`/dashboard/manager/approvals/${expense.id}`}
                    className="flex items-center gap-4 py-4 hover:bg-muted/30 px-2 rounded-lg -mx-2 transition-colors group"
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {expense.user?.name?.substring(0, 2).toUpperCase() ?? '??'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{expense.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">
                        {expense.category} · {new Date(expense.date).toLocaleDateString()}
                      </p>
                      {expense.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[300px] mt-0.5">
                          {expense.description}
                        </p>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm">
                        {expense.amount.toLocaleString()} {expense.currency}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <Badge className={`border text-xs shrink-0 ${cfg.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {cfg.label}
                    </Badge>

                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Processed */}
      {(approved.length > 0 || rejected.length > 0) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recently Processed</CardTitle>
            <CardDescription>Expenses you have already actioned</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {[...approved, ...rejected].slice(0, 10).map((expense) => {
                const cfg = STATUS_CONFIG[expense.status] ?? STATUS_CONFIG.APPROVED;
                const Icon = cfg.icon;
                return (
                  <div key={expense.id} className="flex items-center gap-4 py-3 opacity-70">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {expense.user?.name?.substring(0, 2).toUpperCase() ?? '??'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{expense.user?.name ?? 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{expense.category}</p>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {expense.amount.toLocaleString()} {expense.currency}
                    </span>
                    <Badge className={`border text-xs shrink-0 ${cfg.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {cfg.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
