'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { ApprovalRule } from '@/components/mock/data';
import { Trash2, ToggleLeft } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ApprovalRulesPage() {
  const { state, dispatch } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggleRule = (rule: ApprovalRule) => {
    dispatch({
      type: 'UPDATE_RULE',
      payload: {
        ...rule,
        enabled: !rule.enabled,
      },
    });
    toast.success(`Rule ${rule.enabled ? 'disabled' : 'enabled'}`);
  };

  const handleDeleteRule = (ruleId: string) => {
    if (confirm('Are you sure you want to delete this rule?')) {
      dispatch({ type: 'DELETE_RULE', payload: ruleId });
      toast.success('Rule deleted successfully');
    }
  };

  const getReadableCondition = (rule: ApprovalRule): string => {
    return rule.conditions
      .map((cond, idx) => {
        let readable = '';
        if (cond.type === 'amount') {
          readable = `Amount ${cond.operator} $${cond.value}`;
        } else if (cond.type === 'category') {
          readable = `Category ${cond.operator} "${cond.value}"`;
        } else if (cond.type === 'approver_percentage') {
          readable = `${cond.value}% of approvers`;
        }
        return readable;
      })
      .join(' AND ');
  };

  const getReadableAction = (rule: ApprovalRule): string => {
    if (rule.action === 'require_approver') {
      const approver = state.users.find(u => u.id === rule.metadata.approverId);
      return `Require approval from ${approver?.name || 'Approver'}`;
    } else if (rule.action === 'skip_step') {
      return 'Skip current approval step';
    } else if (rule.action === 'auto_approve') {
      return 'Automatically approve expense';
    }
    return rule.action;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Approval Rules</h1>
          <p className="text-muted-foreground">
            Configure automatic approval routing and conditions
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>Create Rule</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Approval Rule</DialogTitle>
              <DialogDescription>Define a new automatic approval rule</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Rule creation would show a builder UI with conditions and actions
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsOpen(false)}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {state.approvalRules.map(rule => (
          <Card key={rule.id} className={!rule.enabled ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{rule.name}</CardTitle>
                  <CardDescription className="mt-2">
                    {getReadableCondition(rule)}
                  </CardDescription>
                  <div className="mt-3 p-2 bg-muted rounded text-sm">
                    {getReadableAction(rule)}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleRule(rule)}
                    className="gap-2"
                  >
                    <ToggleLeft className="w-4 h-4" />
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {state.approvalRules.length === 0 && (
        <Card>
          <CardContent className="pt-12 text-center">
            <p className="text-muted-foreground mb-4">No approval rules configured</p>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button>Create Your First Rule</Button>
              </DialogTrigger>
            </Dialog>
          </CardContent>
        </Card>
      )}

      {/* Rules Documentation */}
      <Card className="bg-muted/50 border-dashed">
        <CardHeader>
          <CardTitle className="text-base">How Rules Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            • <strong>High Amount Approval:</strong> Expenses over $5,000 automatically route to CFO
          </p>
          <p>
            • <strong>Travel Category Threshold:</strong> Travel expenses over $2,000 require additional approval
          </p>
          <p>
            • <strong>Training Approval:</strong> Training expenses over $1,000 need 60% team approval
          </p>
          <p className="mt-4 text-foreground">
            Rules are evaluated when an expense is submitted and automatically add approval steps.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
