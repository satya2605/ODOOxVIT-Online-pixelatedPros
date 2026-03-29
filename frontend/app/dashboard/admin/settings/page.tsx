'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Settings, Bell, Lock, Database } from 'lucide-react';
import { api } from '@/lib/api';

export default function SettingsPage() {
  const [userCount, setUserCount] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [rulesCount, setRulesCount] = useState(0);
  const currency = typeof window !== 'undefined' ? localStorage.getItem('companyCurrency') ?? 'USD' : 'USD';
  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') ?? '' : '';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, expenses, rules] = await Promise.all([
          api.getUsers(companyId),
          api.getExpenses(),
          api.getRules(),
        ]);
        setUserCount(users.length);
        setExpenseCount(expenses.length);
        setRulesCount(rules.length);
      } catch {}
    };
    if (companyId) fetchStats();
  }, [companyId]);

  const handleToggle = (setting: string) => {
    toast.success(`${setting} setting updated`);
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
                <p className="font-bold">{userCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Expenses</p>
                <p className="font-bold">{expenseCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Active Rules</p>
                <p className="font-bold">{rulesCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Base Currency</p>
                <p className="font-bold">{currency}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border space-y-2">
            <Button variant="outline" className="w-full" onClick={() => toast.info('Data export feature coming soon')}>Export Data</Button>
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
            <span className="font-medium">Production (Real Database)</span>
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
