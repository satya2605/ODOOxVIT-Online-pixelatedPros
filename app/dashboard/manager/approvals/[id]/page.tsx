'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/components/mock/state';
import { ChevronLeft, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function ApprovalDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, approveExpense, rejectExpense } = useApp();
  const [comment, setComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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
      await rejectExpense(expense.id, state.currentUserId, comment);
      toast.success('Expense rejected!');
      setTimeout(() => router.push('/dashboard/manager/approvals'), 1000);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link href="/dashboard/manager/approvals">
        <Button variant="ghost" className="gap-2">
          <ChevronLeft className="w-4 h-4" />
          Back to Approvals
        </Button>
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Expense Details */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{expense.category}</CardTitle>
                  <CardDescription>{expense.employeeName}</CardDescription>
                </div>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${
                    expense.status === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : expense.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Amount</p>
                  <p className="text-3xl font-bold">
                    ${expense.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Date</p>
                  <p className="text-lg font-medium">{expense.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-foreground">{expense.description || 'No description'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Receipt */}
          {expense.receiptUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Receipt</CardTitle>
              </CardHeader>
              <CardContent>
                <img src={expense.receiptUrl} alt="Receipt" className="w-full rounded-lg" />
              </CardContent>
            </Card>
          )}

          {/* Approval Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expense.approvals.map((approval, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          approval.status === 'approved'
                            ? 'bg-green-500'
                            : approval.status === 'rejected'
                            ? 'bg-red-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        {approval.status === 'approved' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : approval.status === 'rejected' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      {idx < expense.approvals.length - 1 && (
                        <div className="w-0.5 h-12 bg-border my-1" />
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="font-medium">
                        {approval.approverName} (Step {approval.step})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {approval.status === 'approved'
                          ? 'Approved'
                          : approval.status === 'rejected'
                          ? 'Rejected'
                          : 'Pending'}
                      </p>
                      {approval.comment && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          {approval.comment}
                        </p>
                      )}
                      {approval.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {approval.timestamp.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Approval Actions Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Your Decision</CardTitle>
              <CardDescription>Review and take action</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Comment (optional)</label>
                <Textarea
                  placeholder="Add a comment..."
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Approve
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing}
                  variant="destructive"
                  className="w-full"
                >
                  Reject
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Next:</strong> This expense will move to the next approval step
                  after you approve.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
