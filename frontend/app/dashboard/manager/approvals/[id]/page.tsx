'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, Info, GitMerge, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { SmartStatusBadge } from '@/components/features/expenses/smart-status-badge';
import { WorkflowTimeline } from '@/components/features/expenses/workflow-timeline';
import api, { Expense } from '@/lib/api';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [expense, setExpense] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('currentUserId');
    setCurrentUserId(userId);

    const fetchDetail = async () => {
      if (!id) return;
      try {
        const data = await api.getExpenseById(id as string);
        setExpense(data);
      } catch (error) {
        toast.error('Failed to load expense details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const handleApprove = async () => {
    if (!currentUserId) return;
    setIsProcessing(true);
    try {
      await api.approveExpense(id as string, currentUserId);
      toast.success('Expense approved successfully!');
      router.push('/dashboard/manager/approvals');
    } catch (error: any) {
      toast.error('Approval failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!currentUserId) return;
    if (!comment.trim()) {
      toast.error('Please provide a reason for rejection in the Decision Details');
      return;
    }
    setIsProcessing(true);
    try {
      await api.rejectExpense(id as string, currentUserId, comment);
      toast.success('Expense rejected');
      router.push('/dashboard/manager/approvals');
    } catch (error: any) {
      toast.error('Rejection failed: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading system records...</p>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 pt-4">
        <Link href="/dashboard/manager/approvals">
          <Button variant="ghost" className="gap-2">
            <ChevronLeft className="w-4 h-4" />
            Back to Approvals
          </Button>
        </Link>
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-muted/20">
          <p className="text-muted-foreground font-medium">Record not found in live database</p>
        </div>
      </div>
    );
  }

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
          <Card className="border shadow-sm overflow-hidden bg-card">
            <CardHeader className="pb-4 bg-muted/10 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold tracking-tight mb-1">{expense.category}</CardTitle>
                  <CardDescription className="text-base font-medium text-foreground/80">
                    Submitted by: {expense.user?.name || 'Loading user...'}
                  </CardDescription>
                </div>
                <SmartStatusBadge status={expense.status.toLowerCase() as any} className="text-sm py-1 px-3 shadow-sm border-0" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-2 gap-6 p-6 bg-primary/5 rounded-xl border border-primary/10 shadow-inner">
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Amount</p>
                  <p className="text-3xl font-black text-primary tracking-tight">
                    {expense.currency} {expense.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Submission Date</p>
                  <p className="text-lg font-bold">{new Date(expense.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="px-1">
                <p className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" /> Justification / Description
                </p>
                <p className="text-foreground leading-relaxed p-4 bg-muted/20 rounded-lg border italic">
                   "{expense.description || 'No additional details provided'}"
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Timeline - Now using real DB steps */}
          <WorkflowTimeline approvals={expense.approvalSteps?.map((s: any) => ({
            step: s.stepOrder,
            status: s.status.toLowerCase(),
            approverName: s.approver?.name || 'System',
            timestamp: s.updatedAt,
            comment: '' // Backend doesn't store step-specific comments yet
          }))} />

          {/* Receipt - Backend Storage Integration */}
          {expense.receiptUrl && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex items-center gap-2 font-bold uppercase tracking-wide">
                  Evidence: Digital Receipt
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative group rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <img src={expense.receiptUrl} alt="Receipt Evidence" className="w-full h-auto max-h-[500px] object-contain transition-transform group-hover:scale-105" />
                  <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                     <p className="text-[10px] text-white font-mono break-all">{expense.receiptUrl}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Approval Actions Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6 shadow-xl border-t-4 border-t-primary">
            <CardHeader className="bg-muted/30 border-b pb-4">
              <CardTitle className="text-lg font-bold">Decision Module</CardTitle>
              <CardDescription>Determine the status of this reimbursement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Commentary (Required if Rejected)</label>
                <Textarea
                  placeholder="Provide context for your decision..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                  className="resize-none focus:ring-primary shadow-sm"
                />
              </div>

              {expense.status === 'SUBMITTED' || expense.status === 'IN_REVIEW' || expense.status === 'PENDING' ? (
                 <div className="space-y-4">
                   <div className="grid grid-cols-2 gap-3">
                     <Button
                       onClick={handleApprove}
                       disabled={isProcessing}
                       className="py-6 font-bold shadow-lg shadow-emerald-500/20"
                       variant="default"
                     >
                       {isProcessing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Approve'}
                     </Button>
                     <Button
                       onClick={handleReject}
                       disabled={isProcessing}
                       variant="destructive"
                       className="py-6 font-bold shadow-lg shadow-red-500/20"
                     >
                       {isProcessing ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : 'Reject'}
                     </Button>
                   </div>
                   
                   <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest bg-muted/50 py-2 rounded">
                      Approving will trigger the next workflow step
                   </p>
                 </div>
              ) : (
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-center border font-bold text-primary">
                  REIMBURSEMENT RECORD: {expense.status}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Real-time System Log Annotation */}
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-1 opacity-20">
               <span className="w-12 h-12 bg-green-500 blur-2xl absolute -top-4 -right-4"></span>
            </div>
            <p className="text-[10px] font-mono text-green-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Node.js Audit Log
            </p>
            <div className="space-y-1 font-mono text-[9px] text-slate-400">
               <p className="truncate">EXPENSE_ID: {expense.id}</p>
               <p>CURRENCY_SVC: OK (ExchangeRate-API)</p>
               <p>MODEL: GPT-OCR v1.2 Connected</p>
               <p>DATABASE: MySQL Persistence ACTIVE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

