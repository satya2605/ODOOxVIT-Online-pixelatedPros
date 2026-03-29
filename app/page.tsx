'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useApp } from '@/components/mock/state';
import { UserRole } from '@/components/mock/data';

export default function Home() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'employee',
      title: 'Employee',
      description: 'Submit and track your expense reimbursements',
      icon: '👤',
      userId: 'user-emp-1',
    },
    {
      id: 'manager',
      title: 'Manager',
      description: 'Review and approve team member expenses',
      icon: '👥',
      userId: 'user-mgr-1',
    },
    {
      id: 'admin',
      title: 'Administrator',
      description: 'Manage users, rules, and approval workflows',
      icon: '⚙️',
      userId: 'user-admin-1',
    },
  ];

  const handleRoleSelect = (role: UserRole, userId: string) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: { role, userId } });
    localStorage.setItem('currentRole', role);
    localStorage.setItem('currentUserId', userId);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3 text-primary">
            Expense Reimbursement System
          </h1>
          <p className="text-lg text-muted-foreground">
            Select your role to get started
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {roles.map(role => (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all border-2 ${
                selectedRole === role.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedRole(role.id as UserRole)}
            >
              <CardHeader>
                <div className="text-4xl mb-3">{role.icon}</div>
                <CardTitle className="text-xl">{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={e => {
                    e.stopPropagation();
                    handleRoleSelect(role.id as UserRole, role.userId);
                  }}
                  variant={selectedRole === role.id ? 'default' : 'outline'}
                >
                  Continue
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 p-4 bg-card border border-border rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            <strong>Demo Mode:</strong> All data is simulated. Changes are stored in session memory.
          </p>
        </div>
      </div>
    </div>
  );
}
