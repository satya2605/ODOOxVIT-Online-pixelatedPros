'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/components/mock/state';

export default function DashboardRouter() {
  const router = useRouter();
  const { state } = useApp();

  // Redirect to role-specific dashboard
  if (state.currentUserRole === 'employee') {
    router.push('/dashboard/employee');
  } else if (state.currentUserRole === 'manager') {
    router.push('/dashboard/manager');
  } else if (state.currentUserRole === 'admin') {
    router.push('/dashboard/admin');
  }

  return <div className="flex items-center justify-center h-full">Loading...</div>;
}
