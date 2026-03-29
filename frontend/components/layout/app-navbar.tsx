'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight, LogOut, UserCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const name = localStorage.getItem('currentUserName') ?? '';
    const role = localStorage.getItem('currentRole') ?? '';
    setUserName(name);
    setUserRole(role);
    setUserInitials(
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'U'
    );
  }, [pathname]); // Re-read on navigation to pick up changes

  const handleLogout = () => {
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserName');
    localStorage.removeItem('companyId');
    localStorage.removeItem('companyCurrency');
    localStorage.removeItem('managerId');
    router.push('/');
  };

  // Build breadcrumbs
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    ...segments
      .slice(1)
      .map((segment, i) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
        href: '/' + segments.slice(0, i + 2).join('/'),
      })),
  ];

  const roleColorMap: Record<string, string> = {
    admin: 'text-violet-500',
    manager: 'text-blue-500',
    employee: 'text-emerald-500',
    cfo: 'text-amber-500',
  };

  const roleColor = roleColorMap[userRole?.toLowerCase()] ?? 'text-muted-foreground';

  return (
    <nav className="border-b border-border bg-card/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-primary font-bold text-lg shrink-0">ERMS</span>
          <div className="flex items-center gap-1 ml-4 overflow-hidden">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                <a
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[120px]"
                >
                  {crumb.label}
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Right: User Info + Menu */}
        <div className="flex items-center gap-4 shrink-0">
          {userName && (
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{userName}</p>
              <p className={`text-xs capitalize font-medium ${roleColor}`}>{userRole}</p>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-9 h-9 rounded-full p-0 flex items-center justify-center font-semibold text-sm border-primary/30 hover:border-primary/60 transition-colors"
              >
                {userInitials}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="flex items-center gap-2">
                <UserCircle2 className="w-4 h-4 text-muted-foreground" />
                {userName || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
