'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/components/mock/state';
import { toast } from 'sonner';
import { Building2, ArrowRight, UserCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  const [email, setEmail] = useState('sarah.chen@company.com'); // Default employee
  const [password, setPassword] = useState('password123'); // Dummy password
  const [isLoading, setIsLoading] = useState(false);

  // For demo, we are showing some quick access role accounts
  const quickAccess = [
    { email: 'sarah.chen@company.com', label: 'Employee', role: 'employee' },
    { email: 'alice.roberts@company.com', label: 'Manager', role: 'manager' },
    { email: 'robert.taylor@company.com', label: 'Admin', role: 'admin' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Lookup user in our mock state
    const user = state.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (user) {
      // Simulate successful login
      dispatch({ type: 'SET_CURRENT_USER', payload: { role: user.role, userId: user.id } });
      localStorage.setItem('currentRole', user.role);
      localStorage.setItem('currentUserId', user.id);
      
      toast.success(`Welcome back, ${user.name}!`);
      router.push('/dashboard');
    } else {
      toast.error('Invalid credentials or user not found. Please register.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-0 left-1/2 -ml-[39rem] -mt-4 transform-gpu blur-3xl" aria-hidden="true">
        <div className="aspect-[978/636] w-[61.125rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground mb-6">
            Enterprise Reimbursement Platform
          </p>
        </div>

        <Card className="border shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Authentication</CardTitle>
            <CardDescription>
              Enter your email and password to log in
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <div className="relative">
                  <UserCircle2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    className="pl-9"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-xs text-primary hover:underline font-medium">Forgot password?</a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
                <p className="text-[10px] text-muted-foreground">For simulation, any password works.</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign in <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-background px-2 text-muted-foreground">Quick Access Demo Roles</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {quickAccess.map((qa) => (
                  <Button 
                    key={qa.role} 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setEmail(qa.email)}
                  >
                    {qa.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6">
            <p className="text-sm text-center text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
