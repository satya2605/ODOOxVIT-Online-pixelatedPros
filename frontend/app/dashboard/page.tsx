'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const role = localStorage.getItem('currentRole');
    if (!role) {
      router.push('/');
      return;
    }
    // Route based on role stored during login
    const roleLower = role.toLowerCase();
    if (roleLower === 'employee') {
      router.push('/dashboard/employee');
    } else if (roleLower === 'manager') {
      router.push('/dashboard/manager');
    } else if (roleLower === 'admin') {
      router.push('/dashboard/admin');
    } else if (roleLower === 'cfo') {
      router.push('/dashboard/manager'); // CFO uses the manager approval view
    } else {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-sm">Loading your workspace...</p>
      </div>
    </div>
  );
}
