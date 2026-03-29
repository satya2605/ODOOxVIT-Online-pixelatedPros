'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { api, User } from '@/lib/api';
import {
  UserPlus, Mail, Trash2, KeyRound, ShieldAlert, Users,
  Briefcase, UserCog, Crown, RefreshCw, Copy, Check, Search
} from 'lucide-react';

const ROLE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  ADMIN: { label: 'Admin', color: 'bg-violet-500/20 text-violet-300 border-violet-500/30', icon: Crown },
  MANAGER: { label: 'Manager', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: UserCog },
  EMPLOYEE: { label: 'Employee', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Briefcase },
  CFO: { label: 'CFO', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: ShieldAlert },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [passwordReveal, setPasswordReveal] = useState<{ userId: string; password: string; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'EMPLOYEE',
    managerId: '',
  });
  const [creatLoading, setCreateLoading] = useState(false);

  const companyId = typeof window !== 'undefined' ? localStorage.getItem('companyId') ?? '' : '';
  const currentUserId = typeof window !== 'undefined' ? localStorage.getItem('currentUserId') ?? '' : '';

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(companyId);
      setUsers(data);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const managers = users.filter((u) => u.role === 'MANAGER' || u.role === 'ADMIN');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.role) {
      toast.error('Please fill in all required fields.');
      return;
    }
    setCreateLoading(true);
    try {
      const created = await api.createUser({
        ...newUser,
        managerId: newUser.managerId || undefined,
        companyId,
      });

      setUsers((prev) => [...prev, created]);
      setOpenCreateModal(false);
      setNewUser({ name: '', email: '', role: 'EMPLOYEE', managerId: '' });

      if (created.tempPassword) {
        setPasswordReveal({ userId: created.id, password: created.tempPassword, email: created.email });
      }

      toast.success(`User ${created.name} created!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleSendPassword = async (user: User) => {
    try {
      const res = await api.sendPassword(user.id);
      setPasswordReveal({ userId: user.id, password: res.tempPassword, email: user.email });
      toast.success('New password generated!');
    } catch {
      toast.error('Failed to generate password.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUserId) {
      toast.error("You can't delete your own account.");
      return;
    }
    setDeletingId(userId);
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success('User removed.');
    } catch {
      toast.error('Failed to delete user. They may have associated data.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async () => {
    if (passwordReveal) {
      await navigator.clipboard.writeText(passwordReveal.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: users.length,
    employees: users.filter((u) => u.role === 'EMPLOYEE').length,
    managers: users.filter((u) => u.role === 'MANAGER').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            User Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage employees, managers, and their roles
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-4 h-4 mr-1.5" /> Refresh
          </Button>
          <Dialog open={openCreateModal} onOpenChange={setOpenCreateModal}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1.5">
                <UserPlus className="w-4 h-4" /> Create User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  A temporary password will be generated. Share it with the user — they can change it later.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="new-name">Full Name *</Label>
                  <Input
                    id="new-name"
                    placeholder="John Doe"
                    value={newUser.name}
                    onChange={(e) => setNewUser((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-email">Email Address *</Label>
                  <Input
                    id="new-email"
                    type="email"
                    placeholder="john@company.com"
                    value={newUser.email}
                    onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-role">Role *</Label>
                  <Select value={newUser.role} onValueChange={(v) => setNewUser((p) => ({ ...p, role: v }))}>
                    <SelectTrigger id="new-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EMPLOYEE">Employee</SelectItem>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="CFO">CFO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(newUser.role === 'EMPLOYEE') && (
                  <div className="space-y-1.5">
                    <Label htmlFor="new-manager">Assign Manager</Label>
                    <Select value={newUser.managerId} onValueChange={(v) => setNewUser((p) => ({ ...p, managerId: v }))}>
                      <SelectTrigger id="new-manager">
                        <SelectValue placeholder="Select a manager..." />
                      </SelectTrigger>
                      <SelectContent>
                        {managers.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name} ({m.role})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <DialogFooter className="mt-4">
                  <Button variant="outline" type="button" onClick={() => setOpenCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={creatLoading}>
                    {creatLoading ? 'Creating...' : 'Create User'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-blue-500' },
          { label: 'Employees', value: stats.employees, icon: Briefcase, color: 'text-emerald-500' },
          { label: 'Managers', value: stats.managers, icon: UserCog, color: 'text-violet-500' },
        ].map((s) => (
          <Card key={s.label} className="border shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* User List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Users ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16 text-muted-foreground gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading users...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No users found</p>
              <p className="text-sm mt-1">Create your first user to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((user) => {
                const cfg = ROLE_CONFIG[user.role] ?? ROLE_CONFIG.EMPLOYEE;
                const Icon = cfg.icon;
                const isCurrentUser = user.id === currentUserId;

                return (
                  <div
                    key={user.id}
                    className={`flex items-center gap-4 px-6 py-4 hover:bg-muted/40 transition-colors ${isCurrentUser ? 'bg-primary/5' : ''}`}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {user.name.substring(0, 2).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{user.name}</p>
                        {isCurrentUser && (
                          <span className="text-xs text-primary font-medium">(you)</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {user.email}
                      </p>
                      {user.manager && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Reports to: {user.manager.name}
                        </p>
                      )}
                    </div>

                    {/* Badge */}
                    <Badge className={`border text-xs font-medium gap-1 ${cfg.color}`}>
                      <Icon className="w-3 h-3" /> {cfg.label}
                    </Badge>

                    {/* Actions */}
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-foreground"
                        onClick={() => handleSendPassword(user)}
                        title="Send / Reset Password"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                      </Button>
                      {!isCurrentUser && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingId === user.id}
                          title="Delete User"
                        >
                          {deletingId === user.id
                            ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            : <Trash2 className="w-3.5 h-3.5" />
                          }
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Password Reveal Modal */}
      <Dialog open={!!passwordReveal} onOpenChange={() => { setPasswordReveal(null); setCopied(false); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-amber-500" />
              Temporary Password
            </DialogTitle>
            <DialogDescription>
              Share this password with <strong>{passwordReveal?.email}</strong>. They should change it after first login.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 p-4 rounded-xl bg-muted border border-primary/20 relative">
            <code className="font-mono text-xl font-bold text-primary tracking-wider">
              {passwordReveal?.password}
            </code>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCopy} className="w-full">
              {copied ? (
                <><Check className="w-4 h-4 mr-2 text-green-500" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4 mr-2" /> Copy to Clipboard</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
