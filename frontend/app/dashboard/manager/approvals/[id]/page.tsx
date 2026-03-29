'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/components/mock/state';
import { ChevronLeft, Info, GitMerge } from 'lucide-react';
import { toast } from 'sonner';

import { SmartStatusBadge } from '@/components/features/expenses/smart-status-badge';
import { WorkflowTimeline } from '@/components/features/expenses/workflow-timeline';
import { RuleEvaluatorCard } from '@/components/features/expenses/rule-evaluator-card';
import { ActivityFeed } from '@/components/features/expenses/activity-feed';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, approveExpense, rejectExpense } = useApp();
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Added escalate and request info simulation actions
  const escalateExpense = async () => {
    toast.success('Expense escalated to Director!');
    console.log('[Dev Note] API Needed: POST /expenses/' + id + '/escalate');
  };

  const requestChanges = async () => {
    if (!comment.trim()) {
      toast.error('Please provide what needs to be changed');
      return;
    }
    toast.success('Change request sent to ' + expense?.employeeName);
    console.log('[Dev Note] API Needed: POST /expenses/' + id + '/request-changes');
  };

  const expense = state.expenses.find(e => e.id === id);

  if (!expense) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/dashboard/manager/approvals">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Approvals
          </Button>
        </Link>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Expense not found</p>
        </div>
      </div>
    );
  }

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      console.log('[Dev Note] API Needed: POST /approvals/' + expense.id + '/approve');
      await approveExpense(expense.id, state.currentUserId, comment);
      toast.success('Expense approved!');
      setTimeout(() => router.push('/dashboard/manager/approvals'), 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!comment.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setIsProcessing(true);
    try {
      console.log('[Dev Note] API Needed: POST /approvals/' + expense.id + '/reject');
      await rejectExpense(expense.id, state.currentUserId, comment);
      toast.success('Expense rejected!');
      setTimeout(() => router.push('/dashboard/manager/approvals'), 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  type ActivityEventType = "submit" | "approve" | "reject" | "rule_trigger" | "system";
  
  // Generate mock events for the activity feed based on approvals
  const mockEvents = [
    {
      id: "ev1",
      type: "submit" as ActivityEventType,
      message: "Expense submitted for review",
      timestamp: expense.createdAt,
      user: expense.employeeName,
    },
    ...expense.approvals.filter(a => a.status !== 'pending').map(a => ({
      id: "ev_app_" + a.step,
      type: (a.status === 'approved' ? 'approve' : 'reject') as ActivityEventType,
      message: a.comment ? `Comment: "${a.comment}"` : `Expense ${a.status}`,
      timestamp: a.timestamp || new Date(),
      user: a.approverName,
    }))
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 flex flex-col pt-4">
      <Link href="/dashboard/manager/approvals" className="w-fit">
        <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" />
          Back to Approvals
        </Button>
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Expense Details */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight mb-1">{expense.category}</CardTitle>
                  <CardDescription className="text-base">{expense.employeeName}</CardDescription>
                </div>
                {/* Replaced with SmartStatusBadge */}
                <SmartStatusBadge status={expense.status} className="text-sm py-1 px-3 shadow-sm border-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold tracking-tight">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Date of Expense</p>
                  <p className="text-lg font-medium">{expense.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="px-1">
                <p className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
                  <Info className="w-4 h-4" /> Description
                </p>
                <p className="text-foreground leading-relaxed">{expense.description || 'No description provided'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rule Evaluator Panel */}
          <RuleEvaluatorCard 
            expense={expense} 
            activeRules={state.approvalRules.filter(r => r.conditions.some(c => c.type === 'amount' && (c.operator === '>' && expense.amount > c.value)))} 
            isPendingPreview={expense.status === 'pending'} 
          />

          {/* Receipt - usually hidden inside an accordion or dialog but left here for UI */}
          {expense.receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">Receipt Document</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={expense.receiptUrl} alt="Receipt" className="w-full max-h-64 object-cover rounded-lg border" />
              </CardContent>
            </Card>
          )}

          {/* Enhanced visual timeline */}
          <WorkflowTimeline approvals={expense.approvals} />
        </div>

        {/* Approval Actions Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-md border-primary/20">
            <CardHeader className="bg-primary/5 border-b border-primary/10 pb-4">
              <CardTitle className="text-lg">Action Box</CardTitle>
              <CardDescription>Review and take appropriate action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Decisions Details</label>
                <Textarea
                  placeholder="Required for rejection or changes..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>

              {expense.status === 'pending' ? (
                 <div className="space-y-3">
                   <div className="flex gap-2">
                     <Button
                       onClick={handleApprove}
                       disabled={isProcessing}
                       className="w-full bg-emerald-600 hover:bg-emerald-700"
                     >
                       Approve
                     </Button>
                     <Button
                       onClick={handleReject}
                       disabled={isProcessing}
                       variant="destructive"
                       className="w-full bg-red-600 hover:bg-red-700"
                     >
                       Reject
                     </Button>
                   </div>
                   
                   <div className="flex gap-2">
                     <Button 
                       variant="outline" 
                       className="w-full text-xs h-9" 
                       onClick={requestChanges}
                     >
                       Request Change
                     </Button>
                     <Button 
                       variant="secondary" 
                       className="w-full text-xs h-9 flex items-center gap-1 text-orange-600 hover:text-orange-700" 
                       onClick={escalateExpense}
                     >
                       <GitMerge className="w-3 h-3" /> Escalate
                     </Button>
                   </div>
                 </div>
              ) : (
                <div className="p-3 bg-muted rounded-md text-sm text-center border">
                  This expense has been {expense.status}
                </div>
              )}

              {/* Backend UI Annotation */}
              <div className="p-3 mt-4 bg-slate-900 rounded-md border border-slate-700 shadow-inner">
                <p className="text-xs font-mono text-green-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Dev API Monitor
                </p>
                <p className="text-[10px] font-mono text-slate-300">
                  Ready Hooks:<br/>
                  POST /api/v1/approvals/:id<br/>
                  PUT /api/v1/expenses/:id/escalate
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Activity Feed */}
          <ActivityFeed events={mockEvents} />
        </div>
      </div>
    </div>
  );
}
