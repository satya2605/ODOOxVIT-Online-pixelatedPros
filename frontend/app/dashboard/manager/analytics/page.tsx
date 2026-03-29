'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { api, Expense } from '@/lib/api';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ManagerAnalyticsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await api.getExpenses();
      setExpenses(data);
    } catch {
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // Compute analytics from real expense data
  const managedExpenses = expenses;

  // Category breakdown
  const categoryData = managedExpenses.reduce((acc, exp) => {
    const existing = acc.find(c => c.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
      existing.count += 1;
    } else {
      acc.push({ name: exp.category, value: exp.amount, count: 1 });
    }
    return acc;
  }, [] as Array<{ name: string; value: number; count: number }>);

  // Status breakdown
  const statusData = [
    { name: 'Approved', value: managedExpenses.filter(e => e.status === 'APPROVED').length, fill: '#10B981' },
    { name: 'Pending', value: managedExpenses.filter(e => e.status === 'SUBMITTED' || e.status === 'IN_REVIEW').length, fill: '#FBBF24' },
    { name: 'Rejected', value: managedExpenses.filter(e => e.status === 'REJECTED').length, fill: '#EF4444' },
  ];

  // Daily trend (last 7 days)
  const dailyTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayExpenses = managedExpenses.filter(e =>
      new Date(e.date).toDateString() === date.toDateString()
    );
    return { date: dateStr, amount: dayExpenses.reduce((sum, e) => sum + e.amount, 0), count: dayExpenses.length };
  });

  const totalAmount = managedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const approvalRate = managedExpenses.length > 0
    ? Math.round((managedExpenses.filter(e => e.status === 'APPROVED').length / managedExpenses.length) * 100)
    : 0;


  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Team Analytics</h1>
        <p className="text-muted-foreground text-sm">Spending and approval metrics across all expenses</p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">{managedExpenses.length} expenses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvalRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">{managedExpenses.filter(e => e.status === 'APPROVED').length} approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedExpenses.filter(e => e.status === 'SUBMITTED' || e.status === 'IN_REVIEW').length}</div>
            <p className="text-xs text-muted-foreground mt-1">awaiting action</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{managedExpenses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Spending Trend</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                  formatter={(value) => `${Number(value).toLocaleString()}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#714B67"
                  strokeWidth={2}
                  name="Amount"
                  dot={{ fill: '#714B67' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Expense status breakdown</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Spending by Category</CardTitle>
          <CardDescription>Amount and count by expense category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{ backgroundColor: '#FFF', border: '1px solid #E5E7EB' }}
                formatter={(value) => `${Number(value).toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="value" fill="#714B67" name="Amount" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Employee Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Member Summary</CardTitle>
          <CardDescription>Spending by expense category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Category</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Count</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {categoryData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-muted-foreground">No expense data yet</td>
                  </tr>
                ) : categoryData.map((cat) => (
                  <tr key={cat.name} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-sm font-medium">{cat.name}</td>
                    <td className="py-3 px-4 text-sm text-right">{cat.count}</td>
                    <td className="py-3 px-4 text-sm text-right font-bold">
                      {cat.value.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
