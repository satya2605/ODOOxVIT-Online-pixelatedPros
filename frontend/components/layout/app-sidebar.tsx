'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart3,
  ClipboardList,
  Settings,
  Users,
  FileText,
  Zap,
  Home,
} from 'lucide-react';
import { useApp } from '@/components/mock/state';

export function AppSidebar() {
  const { state } = useApp();
  const pathname = usePathname();

  const navItems = {
    employee: [
      { label: 'Dashboard', href: '/dashboard/employee', icon: Home },
      { label: 'Submit Expense', href: '/dashboard/employee/submit', icon: FileText },
      { label: 'My Expenses', href: '/dashboard/employee/expenses', icon: ClipboardList },
      { label: 'Approvals', href: '/dashboard/employee/approvals', icon: Zap },
    ],
    manager: [
      { label: 'Dashboard', href: '/dashboard/manager', icon: Home },
      { label: 'Team Approvals', href: '/dashboard/manager/approvals', icon: ClipboardList },
      { label: 'Analytics', href: '/dashboard/manager/analytics', icon: BarChart3 },
    ],
    admin: [
      { label: 'Dashboard', href: '/dashboard/admin', icon: Home },
      { label: 'User Management', href: '/dashboard/admin/users', icon: Users },
      { label: 'Approval Rules', href: '/dashboard/admin/approval-rules', icon: Zap },
      { label: 'Workflows', href: '/dashboard/admin/workflows', icon: Settings },
      { label: 'Settings', href: '/dashboard/admin/settings', icon: Settings },
    ],
  };

  const items = navItems[state.currentUserRole] || [];

  return (
    <aside className="w-64 border-r border-border bg-card h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
