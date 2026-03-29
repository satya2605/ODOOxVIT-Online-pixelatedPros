'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppNavbar } from '@/components/layout/app-navbar';
import { AppSidebar } from '@/components/layout/app-sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem('currentRole');
    const savedUserId = localStorage.getItem('currentUserId');
    if (!savedRole || !savedUserId) {
      router.push('/');
    }
  }, [router]);

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AppNavbar />
        <main className="flex-1 overflow-y-auto bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}
