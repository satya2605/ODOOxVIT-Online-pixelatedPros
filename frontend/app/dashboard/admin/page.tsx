'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, User } from '@/lib/api';
import { Users, Zap, Settings, TrendingUp, Building2, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [rulesCount, setRulesCount] = useState(0);
  const [expensesCount, setExpensesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') ?? '' : '';
  const userName = typeof window !== 'undefined' ? localStorage.getItem('currentUserName') ?? 'Admin' : 'Admin';
  const currency = typeof window !== 'undefined' ? localStorage.getItem('companyCurrency') ?? 'USD' : 'USD';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [usersData, rulesData, expensesData] = await Promise.all([
          api.getUsers(companyId),
          api.getRules(),
          api.getExpenses(),
        ]);
        setUsers(usersData);
        setRulesCount(rulesData.length);
        setExpensesCount(expensesData.length);
      } catch {
        // silently fail — show zeros
      } finally {
        setLoading(false);
      }
    };
    if (companyId) fetchData();
  }, [companyId]);

  const stats = {
    total: users.length,
    employees: users.filter((u) => u.role === 'EMPLOYEE').length,
    managers: users.filter((u) => u.role === 'MANAGER').length,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5 text-violet-500" />
            <h1 className="text-2xl font-bold tracking-tight">Administration</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, <strong>{userName}</strong> · Company currency:{' '}
            <span className="font-semibold text-primary">{currency}</span>
          </p>
        </div>
        {loading && <RefreshCw className="w-4 h-4 animate-spin text-muted-foreground mt-1" />}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.total, sub: `${stats.employees} employees, ${stats.managers} managers`, icon: Users, color: 'text-blue-500' },
          { label: 'Approval Rules', value: rulesCount, sub: 'Configured policies', icon: Zap, color: 'text-violet-500' },
          { label: 'Total Expenses', value: expensesCount, sub: 'All time', icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Base Currency', value: currency, sub: 'Company default', icon: Settings, color: 'text-amber-500' },
        ].map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardTitle className={`text-xs font-medium text-muted-foreground flex items-center gap-1.5`}>
                <s.icon className={`w-3.5 h-3.5 ${s.color}`} />
                {s.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
              <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Management Modules */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* User Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" /> User Management
            </CardTitle>
            <CardDescription>Add employees, assign managers, and manage roles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {stats.employees} employee{stats.employees !== 1 ? 's' : ''}</li>
              <li>• {stats.managers} manager{stats.managers !== 1 ? 's' : ''}</li>
              <li>• 1 administrator (you)</li>
            </ul>
            <Link href="/dashboard/admin/users" className="block">
              <Button variant="outline" className="w-full">Manage Users</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Approval Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" /> Approval Rules
            </CardTitle>
            <CardDescription>Configure automatic approval routing and conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• {rulesCount} rule{rulesCount !== 1 ? 's' : ''} configured</li>
              <li>• Supports Percentage, Role-based, Hybrid logic</li>
              <li>• Sequential &amp; parallel approver ordering</li>
            </ul>
            <Link href="/dashboard/admin/approval-rules" className="block">
              <Button variant="outline" className="w-full">Manage Rules</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" /> Workflow Configuration
            </CardTitle>
            <CardDescription>Define approval workflow steps and multi-level sequences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Multi-step sequential approvals</li>
              <li>• Manager-first routing toggle</li>
              <li>• Percentage threshold support</li>
            </ul>
            <Link href="/dashboard/admin/workflows" className="block">
              <Button variant="outline" className="w-full">Edit Workflow</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" /> System Settings
            </CardTitle>
            <CardDescription>General configuration and company preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Base currency: <strong>{currency}</strong></li>
              <li>• {expensesCount} total expense record{expensesCount !== 1 ? 's' : ''}</li>
              <li>• Receipt upload policies</li>
            </ul>
            <Link href="/dashboard/admin/settings" className="block">
              <Button variant="outline" className="w-full">System Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
