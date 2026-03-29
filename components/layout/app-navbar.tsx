'use client';

import { useRouter, usePathname } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useApp } from '@/components/mock/state';
import { mockUsers } from '@/components/mock/data';

export function AppNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { state, dispatch } = useApp();

  const currentUser = mockUsers.find(u => u.id === state.currentUserId);

  const handleRoleChange = (role: string, userId: string) => {
    dispatch({ type: 'SET_CURRENT_USER', payload: { userId, role: role as any } });
    localStorage.setItem('currentRole', role);
    localStorage.setItem('currentUserId', userId);
    router.push('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('currentRole');
    localStorage.removeItem('currentUserId');
    router.push('/');
  };

  // Build breadcrumbs
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [
    { label: 'Dashboard', href: '/dashboard' },
    ...segments
      .slice(1)
      .map((segment, i) => ({
        label: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: '/' + segments.slice(0, i + 2).join('/'),
      })),
  ];

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-40">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-2 flex-1">
          <span className="text-primary font-bold text-lg">ERMS</span>
          <div className="flex items-center gap-1 ml-4">
            {breadcrumbs.map((crumb, i) => (
              <div key={crumb.href} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <a
                  href={crumb.href}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {crumb.label}
                </a>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium">{currentUser?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{state.currentUserRole}</p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-10 h-10 rounded-full p-0 flex items-center justify-center"
              >
                {currentUser?.avatar || 'U'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Role Selection</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleRoleChange('employee', 'user-emp-1')}>
                Employee (Sarah Chen)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('manager', 'user-mgr-1')}>
                Manager (Alice Roberts)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleRoleChange('admin', 'user-admin-1')}>
                Admin (Robert Taylor)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
