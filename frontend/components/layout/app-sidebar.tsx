'use client';

import { useEffect, useState } from 'react';
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
  Crown,
} from 'lucide-react';

type NavItem = { label: string; href: string; icon: React.ElementType };

const navItems: Record<string, NavItem[]> = {
  employee: [
    { label: 'Dashboard', href: '/dashboard/employee', icon: Home },
    { label: 'Submit Expense', href: '/dashboard/employee/submit', icon: FileText },
    { label: 'My Expenses', href: '/dashboard/employee/expenses', icon: ClipboardList },
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
  cfo: [
    { label: 'Dashboard', href: '/dashboard/manager', icon: Home },
    { label: 'Team Approvals', href: '/dashboard/manager/approvals', icon: ClipboardList },
  ],
};

export function AppSidebar() {
  const pathname = usePathname();
  const [role, setRole] = useState('');

  useEffect(() => {
    const r = localStorage.getItem('currentRole') ?? '';
    setRole(r.toLowerCase());
  }, [pathname]);

  const items = navItems[role] ?? [];

  return (
    <aside className="w-60 border-r border-border bg-card h-screen flex flex-col">
      {/* Brand Area */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Crown className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">ERMS</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
