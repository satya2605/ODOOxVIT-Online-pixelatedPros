'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/mock/state';
import { Users, Zap, Settings, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const { state } = useApp();

  const stats = {
    totalUsers: state.users.length,
    employees: state.users.filter(u => u.role === 'employee').length,
    managers: state.users.filter(u => u.role === 'manager').length,
    totalExpenses: state.expenses.length,
    activeRules: state.approvalRules.filter(r => r.enabled).length,
    workflowSteps: state.workflowSteps.length,
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Administration</h1>
        <p className="text-muted-foreground">Manage system configuration and settings</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.employees} employees, {stats.managers} managers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Approval Rules
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalUsers - stats.activeRules} disabled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Workflow Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.workflowSteps}</div>
            <p className="text-xs text-muted-foreground mt-1">approval stages</p>
          </CardContent>
        </Card>
      </div>

      {/* Management Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              User Management
            </CardTitle>
            <CardDescription>Add, edit, and remove users from the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Overview</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {stats.employees} employees</li>
                <li>• {stats.managers} managers</li>
                <li>• 1 administrator</li>
              </ul>
            </div>
            <Link href="/dashboard/admin/users" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Users
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Approval Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Approval Rules
            </CardTitle>
            <CardDescription>Configure automatic approval routing and conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Active Rules</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {state.approvalRules.filter(r => r.enabled).length} rules enabled</li>
                <li>• {state.approvalRules.filter(r => !r.enabled).length} rules disabled</li>
              </ul>
            </div>
            <Link href="/dashboard/admin/approval-rules" className="w-full">
              <Button variant="outline" className="w-full">
                Manage Rules
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Workflow Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Workflow Configuration
            </CardTitle>
            <CardDescription>Define approval workflow steps and requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Current Workflow</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {state.workflowSteps.map(step => (
                  <li key={step.id}>
                    • Step {step.stepNumber}: {step.name}
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/dashboard/admin/workflows" className="w-full">
              <Button variant="outline" className="w-full">
                Edit Workflow
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              System Settings
            </CardTitle>
            <CardDescription>General system configuration and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Statistics</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• {stats.totalExpenses} total expenses</li>
                <li>• {state.expenses.filter(e => e.status === 'pending').length} pending review</li>
              </ul>
            </div>
            <Link href="/dashboard/admin/settings" className="w-full">
              <Button variant="outline" className="w-full">
                System Settings
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
