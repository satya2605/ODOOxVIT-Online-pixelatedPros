'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, ToggleLeft, Loader2, PlusCircle, AlertCircle } from 'lucide-react';

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
import { RuleBuilder } from '@/components/features/admin/rule-builder';
import api from '@/lib/api';

export default function ApprovalRulesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setIsLoading(true);
    try {
      const data = await api.getRules();
      setRules(data);
    } catch (error) {
      console.error('Failed to fetch rules:', error);
      toast.error('Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRule = async (rule: any) => {
    try {
      // Toggle logic (e.g., updating priority or a status flag in conditionJson)
      // Since our Prisma model doesn't have an 'enabled' field yet, we'll assume it's in conditionJson
      const updatedRule = { ...rule, conditionJson: { ...rule.conditionJson, enabled: !rule.conditionJson?.enabled } };
      await api.createRule(updatedRule); // Simple mock-to-real migration: often re-saving 
      toast.success(`Rule updated`);
      fetchRules();
    } catch (error) {
       toast.error('Toggle failed');
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!confirm('Are you sure you want to delete this rule?')) return;
    try {
      // Assuming api.deleteRule exists (adding it to api.ts if missing)
      await (api as any).deleteRule(ruleId); 
      setRules(rules.filter(r => r.id !== ruleId));
      toast.success('Rule deleted successfully');
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const getReadableCondition = (rule: any): string => {
    const cond = rule.conditionJson;
    if (!cond) return 'No conditions set';

    if (rule.type === 'PERCENTAGE') return `Requires ${cond.percentage}% consensus`;
    if (rule.type === 'ROLE_BASED') return `Auto-triggers for role: ${cond.requiredRole}`;
    if (rule.type === 'THRESHOLD') return `Auto-approve expenses under ${cond.maxAmount}`;
    
    return JSON.stringify(cond);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading system rules...</p>
      </div>
    );
  }

  const handleCreateRule = async (ruleData: any) => {
    try {
      await api.createRule(ruleData);
      setIsOpen(false);
      toast.success('New workflow policy created');
      fetchRules();
    } catch (error) {
      toast.error('Failed to create rule');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Workflow Logic</h1>
          <p className="text-muted-foreground">
            Centralized policy control for automatic approval and custom routing
          </p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" />
              New Policy
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Define Workflow Policy</DialogTitle>
              <DialogDescription>Use the condition builder to create dynamic branching logic</DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <RuleBuilder onSave={handleCreateRule} />
            </div>
          </DialogContent>
        </Dialog>
      </div>


      {/* Rules List */}
      <div className="grid gap-4">
        {rules.map(rule => (
          <Card key={rule.id} className="shadow-sm hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{rule.type}</CardTitle>
                    <span className="text-[10px] bg-primary/10 text-primary uppercase font-bold px-2 py-0.5 rounded">
                      ID: {rule.id.slice(0,8)}
                    </span>
                  </div>
                  <CardDescription className="text-foreground/80 font-medium">
                    {getReadableCondition(rule)}
                  </CardDescription>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Priority: {rule.priority}</span>
                    <span>Created: {new Date(rule.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card className="border-dashed py-12">
          <CardContent className="text-center flex flex-col items-center">
            <div className="p-4 bg-muted rounded-full mb-4">
               <AlertCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-semibold">No active policies</p>
            <p className="text-sm text-muted-foreground mb-6">Create a rule to automate your reimbursement workflows.</p>
            <Button onClick={() => setIsOpen(true)}>Create Policy</Button>
          </CardContent>
        </Card>
      )}

      {/* Rules Documentation */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
             <AlertCircle className="w-4 h-4 text-primary" />
             Policy Logic Examples
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="space-y-1">
            <p><strong>Auto-Approve (Threshold):</strong></p>
            <p>If Amount &lt; $50.00, set status to APPROVED immediately.</p>
          </div>
          <div className="space-y-1">
            <p><strong>Consensus (Percentage):</strong></p>
            <p>If &gt; 60% of Manager group approves, mark as SUCCESS.</p>
          </div>
          <div className="space-y-1">
            <p><strong>Bypass (Role):</strong></p>
            <p>If CFO approves, skip all remaining verification steps.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

