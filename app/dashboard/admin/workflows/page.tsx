'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useApp } from '@/components/mock/state';
import { WorkflowStep } from '@/components/mock/data';
import { ArrowDown, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export default function WorkflowsPage() {
  const { state, dispatch } = useApp();
  const [steps, setSteps] = useState<WorkflowStep[]>(state.workflowSteps);
  const [newRole, setNewRole] = useState<'manager' | 'finance' | 'director'>('manager');

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: `step-${Date.now()}`,
      stepNumber: Math.max(...steps.map(s => s.stepNumber), 0) + 1,
      requiredRole: newRole,
      name: getRoleName(newRole),
    };
    setSteps([...steps]);
    toast.success('Step added');
  };

  const handleDeleteStep = (stepId: string) => {
    if (steps.length === 1) {
      toast.error('You must have at least one approval step');
      return;
    }
    setSteps(steps.filter(s => s.id !== stepId));
    toast.success('Step deleted');
  };

  const handleSave = () => {
    dispatch({
      type: 'UPDATE_WORKFLOW_STEPS',
      payload: steps,
    });
    toast.success('Workflow saved successfully');
  };

  const getRoleName = (role: string): string => {
    const roleMap: Record<string, string> = {
      manager: 'Manager Review',
      finance: 'Finance Review',
      director: 'Director Approval',
    };
    return roleMap[role] || role;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Approval Workflow</h1>
        <p className="text-muted-foreground">
          Define the steps required for expense approval
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Workflow</CardTitle>
          <CardDescription>Approval steps in order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Workflow Visualization */}
          <div className="space-y-2">
            {steps.map((step, idx) => (
              <div key={step.id} className="space-y-2">
                <div className="flex items-center gap-4 p-4 border border-border rounded-lg bg-muted/50">
                  <GripVertical className="w-5 h-5 text-muted-foreground cursor-grab" />
                  <div className="flex-1">
                    <p className="font-medium">Step {step.stepNumber}</p>
                    <p className="text-sm text-muted-foreground">{step.name}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteStep(step.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                {idx < steps.length - 1 && (
                  <div className="flex justify-center">
                    <ArrowDown className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Step */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm font-medium mb-3">Add New Step</p>
            <div className="flex gap-2">
              <Select value={newRole} onValueChange={v => setNewRole(v as any)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager Review</SelectItem>
                  <SelectItem value="finance">Finance Review</SelectItem>
                  <SelectItem value="director">Director Approval</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddStep} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Step
              </Button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-border">
            <Button onClick={handleSave} className="w-full">
              Save Workflow
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">How Workflow Steps Work</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>
            • Each step requires approval from the specified role before moving to the next
          </p>
          <p>
            • If a step is rejected, the expense goes back to the employee
          </p>
          <p>
            • Steps are processed in order, and all steps must be completed for final approval
          </p>
          <p>
            • Approval rules can add additional approvers or skip steps automatically
          </p>
        </CardContent>
      </Card>

      {/* Current Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Current Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {steps.map(step => (
              <div key={step.id} className="flex justify-between">
                <span className="font-medium">Step {step.stepNumber}:</span>
                <span className="text-muted-foreground">{step.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
