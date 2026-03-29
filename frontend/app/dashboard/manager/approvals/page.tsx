'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { mockUsers } from '@/components/mock/data';
import { Checkbox } from '@/components/ui/checkbox';
import { ChevronRight, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagerApprovalsPage() {
  const { state, dispatch } = useApp();
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Get managed employees
  const managedEmployees = mockUsers.filter(u => u.managerId === state.currentUserId);
  const managedExpenses = state.expenses.filter(e =>
    managedEmployees.some(emp => emp.id === e.employeeId)
  );

  const pendingExpenses = managedExpenses.filter(e => e.status === 'pending');
  const approvedExpenses = managedExpenses.filter(e => e.status === 'approved');
  const rejectedExpenses = managedExpenses.filter(e => e.status === 'rejected');

  const handleSelectAll = () => {
    if (selectedIds.length === pendingExpenses.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingExpenses.map(e => e.id));
    }
  };

  const handleToggleExpense = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = async () => {
    for (const id of selectedIds) {
      dispatch({
        type: 'APPROVE_EXPENSE',
        payload: { expenseId: id, approverId: state.currentUserId },
      });
    }
    setSelectedIds([]);
    toast.success(`Approved ${selectedIds.length} expense(s)`);
  };

  const handleBulkReject = async () => {
    for (const id of selectedIds) {
      dispatch({
        type: 'REJECT_EXPENSE',
        payload: { expenseId: id, approverId: state.currentUserId, comment: 'Bulk rejected by manager' },
      });
    }
    setSelectedIds([]);
    toast.success(`Rejected ${selectedIds.length} expense(s)`);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Team Approvals</h1>
          <p className="text-muted-foreground">Review and approve team member expenses</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="w-4 h-4" />
            List
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            onClick={() => setViewMode('kanban')}
            className="gap-2"
          >
            <LayoutGrid className="w-4 h-4" />
            Kanban
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{pendingExpenses.length}</div>
            <p className="text-sm text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{approvedExpenses.length}</div>
            <p className="text-sm text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{rejectedExpenses.length}</div>
            <p className="text-sm text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="font-medium">{selectedIds.length} expenses selected</p>
              <div className="flex gap-2">
                <Button onClick={handleBulkApprove} size="sm">
                  Approve All
                </Button>
                <Button onClick={handleBulkReject} variant="destructive" size="sm">
                  Reject All
                </Button>
                <Button
                  onClick={() => setSelectedIds([])}
                  variant="outline"
                  size="sm"
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Expenses awaiting your review</CardDescription>
              </div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={selectedIds.length === pendingExpenses.length && pendingExpenses.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm">Select All</span>
              </label>
            </div>
          </CardHeader>
          <CardContent>
            {pendingExpenses.length > 0 ? (
              <div className="space-y-2">
                {pendingExpenses.map(expense => (
                  <Link
                    key={expense.id}
                    href={`/dashboard/manager/approvals/${expense.id}`}
                  >
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors group">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={selectedIds.includes(expense.id)}
                          onCheckedChange={() => handleToggleExpense(expense.id)}
                          onClick={e => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{expense.employeeName}</p>
                          <p className="text-sm text-muted-foreground">
                            {expense.category} • {expense.date.toLocaleDateString()}
                          </p>
                          <p className="text-sm">{expense.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold">${expense.amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">{expense.currency}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-4">
          {[
            { title: 'Submitted', status: 'pending', expenses: pendingExpenses },
            { title: 'Approved', status: 'approved', expenses: approvedExpenses },
            { title: 'Rejected', status: 'rejected', expenses: rejectedExpenses },
          ].map(column => (
            <Card key={column.status}>
              <CardHeader>
                <CardTitle className="text-base">{column.title}</CardTitle>
                <p className="text-2xl font-bold text-muted-foreground">{column.expenses.length}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {column.expenses.map(expense => (
                    <Link
                      key={expense.id}
                      href={`/dashboard/manager/approvals/${expense.id}`}
                    >
                      <div className="p-3 border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors cursor-pointer">
                        <p className="font-medium text-sm">{expense.employeeName}</p>
                        <p className="text-xs text-muted-foreground">{expense.category}</p>
                        <p className="text-sm font-bold mt-2">${expense.amount.toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
