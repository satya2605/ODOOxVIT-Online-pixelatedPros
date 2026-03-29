'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Bell, Lock, Database } from 'lucide-react';

export default function SettingsPage() {
  const { state } = useApp();

  const handleToggle = (setting: string) => {
    toast.success(`${setting} setting updated`);
  };

  const handleReset = () => {
    if (confirm('Are you sure? This will reset all demo data.')) {
      toast.success('Demo data has been reset');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">System Settings</h1>
        <p className="text-muted-foreground">Configure system preferences and behavior</p>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-Approval</Label>
              <p className="text-sm text-muted-foreground">
                Automatically approve expenses under $500
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Auto-Approval')} defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Require Receipt Upload</Label>
              <p className="text-sm text-muted-foreground">
                Enforce receipt upload for all expenses
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Receipt Upload')} defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send email on approval status changes
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Email Notifications')} defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Employee Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Notify employees when expenses are approved/rejected
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Employee Notifications')} defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Manager Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Alert managers of pending approvals
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Manager Alerts')} defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Budget Warnings</Label>
              <p className="text-sm text-muted-foreground">
                Warn when spending approaches budget limits
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Budget Warnings')} defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Require 2FA for admin accounts
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('2FA')} defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="space-y-0.5">
              <Label>Audit Logging</Label>
              <p className="text-sm text-muted-foreground">
                Log all system changes and approvals
              </p>
            </div>
            <Switch onCheckedChange={() => handleToggle('Audit Logging')} defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      {/* Database Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">System Statistics</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Users</p>
                <p className="font-bold">{state.users.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Expenses</p>
                <p className="font-bold">{state.expenses.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Rules</p>
                <p className="font-bold">{state.approvalRules.filter(r => r.enabled).length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Workflow Steps</p>
                <p className="font-bold">{state.workflowSteps.length}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="outline" className="w-full" onClick={() => toast.info('Data exported')}>
              Export Data
            </Button>
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleReset}
            >
              Reset Demo Data
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Information */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-base">System Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Application</span>
            <span className="font-medium">Expense Reimbursement Management System</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mode</span>
            <span className="font-medium">Demo (Simulated)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Last Updated</span>
            <span className="font-medium">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
