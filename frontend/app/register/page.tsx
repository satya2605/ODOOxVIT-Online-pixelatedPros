'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useApp } from '@/components/mock/state';
import { UserRole } from '@/components/mock/data';
import { toast } from 'sonner';
import { Building2, ArrowLeft, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { state, dispatch } = useApp();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: 'employee' as UserRole,
  });
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate email doesn't already exist
    if (state.users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      toast.error('An account with this email already exists.');
      setIsLoading(false);
      return;
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Construct new user matching our interface
    const newUser = {
      id: `user-${formData.role}-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      role: formData.role,
      department: formData.department,
      avatar: formData.name.substring(0, 2).toUpperCase(),
      managerId: formData.role === 'employee' ? 'user-mgr-1' : undefined, // Assign default manager for demo
    };

    // Simulate saving registering
    dispatch({ type: 'CREATE_USER', payload: newUser });
    
    // Once created, automatically log them in
    dispatch({ type: 'SET_CURRENT_USER', payload: { role: newUser.role, userId: newUser.id } });
    localStorage.setItem('currentRole', newUser.role);
    localStorage.setItem('currentUserId', newUser.id);
    
    toast.success(`Account created successfully! Welcome, ${newUser.name}.`);
    router.push('/dashboard');
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-0 right-1/2 ml-[-20rem] mt-[-10rem] transform-gpu blur-3xl opacity-30" aria-hidden="true">
        <div className="aspect-[978/636] w-[61.125rem] bg-gradient-to-tr from-[#9089fc] to-[#2563eb]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-foreground tracking-tight">
            Create an Account
          </h2>
          <p className="mt-2 text-center text-sm text-muted-foreground mb-6">
            Join the Enterprise Reimbursement Platform
          </p>
        </div>

        <Card className="border shadow-xl bg-white/80 backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Registration</CardTitle>
            <CardDescription>
              Fill out the required information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g. John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="name@company.com" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select 
                    value={formData.department} 
                     onValueChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Engineering">Engineering</SelectItem>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role Status</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, role: val as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <Button type="submit" className="w-full mt-6" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col border-t pt-6 bg-slate-50/50 rounded-b-xl">
            <Link href="/" className="flex items-center text-sm font-semibold text-primary hover:underline group">
              <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" /> Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
