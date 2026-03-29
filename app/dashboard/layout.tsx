'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/app-navbar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { useApp } from '@/components/mock/state';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Check if user is logged in, otherwise redirect to home
    const savedRole = localStorage.getItem('currentRole');
    const savedUserId = localStorage.getItem('currentUserId');

    if (savedRole && savedUserId) {
      dispatch({
        type: 'SET_CURRENT_USER',
        payload: { role: savedRole as any, userId: savedUserId },
      });
    } else if (!state.currentUserRole) {
      router.push('/');
    }
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
