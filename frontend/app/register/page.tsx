'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Building2, ArrowLeft, ArrowRight, Globe, Lock, Mail, User, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface Country {
  name: { common: string; official: string };
  currencies?: { [code: string]: { name: string; symbol: string } };
  cca2: string;
}

interface CountryOption {
  name: string;
  currency: string;
  currencyName: string;
  code: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    companyName: '',
    password: '',
    confirmPassword: '',
    country: '',
    currency: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all countries + currencies from restcountries API
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch('https://restcountries.com/v3.1/all?fields=name,currencies,cca2');
        const data: Country[] = await res.json();

        const processed = data
          .filter((c) => c.currencies && Object.keys(c.currencies).length > 0)
          .map((c) => {
            const currencyCode = Object.keys(c.currencies!)[0];
            const currencyInfo = c.currencies![currencyCode];
            return {
              name: c.name.common,
              currency: currencyCode,
              currencyName: currencyInfo.name,
              code: c.cca2,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(processed);
      } catch (err) {
        toast.error('Failed to load country list. Please refresh.');
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  const handleCountryChange = (countryName: string) => {
    const selected = countries.find((c) => c.name === countryName);
    setFormData((prev) => ({
      ...prev,
      country: countryName,
      currency: selected?.currency ?? '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.currency) {
      toast.error('Please select a country.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/signup`, {
        name: formData.name,
        email: formData.email,
        companyName: formData.companyName,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        country: formData.country,
        currency: formData.currency,
      });

      const { user } = res.data;
      localStorage.setItem('currentUserId', user.id);
      localStorage.setItem('currentRole', user.role);
      localStorage.setItem('currentUserName', user.name);
      localStorage.setItem('companyId', user.companyId);
      localStorage.setItem('companyCurrency', formData.currency);

      toast.success(`Welcome, ${user.name}! Your company has been created.`);
      router.push('/dashboard');
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Signup failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        {/* Header */}
        <div className="flex justify-center flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/25 mb-5">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-center text-3xl font-bold text-white tracking-tight">
            Create your company
          </h1>
          <p className="mt-2 text-center text-sm text-slate-400">
            Set up a new workspace for your organization
          </p>
          <div className="mt-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <p className="text-xs text-indigo-300 font-medium">1 admin user per company</p>
          </div>
        </div>

        <Card className="border border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl text-white">Admin Signup</CardTitle>
            <CardDescription className="text-slate-400">
              You will be the administrator of this company account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-300 text-sm">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="name"
                    placeholder="e.g. Jane Smith"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500 focus:ring-indigo-500/20"
                    value={formData.name}
                    onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 text-sm">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@company.com"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <Label htmlFor="companyName" className="text-slate-300 text-sm">Company Name</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="companyName"
                    placeholder="e.g. Acme Corporation"
                    className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={formData.companyName}
                    onChange={(e) => setFormData((p) => ({ ...p, companyName: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 text-sm">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={formData.password}
                    onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <Label htmlFor="confirmPassword" className="text-slate-300 text-sm">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <Input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    className="pl-9 pr-10 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData((p) => ({ ...p, confirmPassword: e.target.value }))}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Country Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="country" className="text-slate-300 text-sm">
                  Country <span className="text-slate-500 text-xs">(sets company base currency)</span>
                </Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-slate-500 z-10 pointer-events-none" />
                  <Select
                    value={formData.country}
                    onValueChange={handleCountryChange}
                    disabled={loadingCountries}
                  >
                    <SelectTrigger className="pl-9 bg-white/5 border-white/10 text-white focus:border-indigo-500 [&>span]:text-white">
                      <SelectValue placeholder={loadingCountries ? 'Loading countries...' : 'Select your country'} />
                    </SelectTrigger>
                    <SelectContent className="max-h-72 bg-slate-900 border-white/10 text-white">
                      {countries.map((c) => (
                        <SelectItem
                          key={c.code}
                          value={c.name}
                          className="text-slate-200 focus:bg-indigo-600/30 focus:text-white cursor-pointer"
                        >
                          {c.name} — {c.currency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.currency && (
                  <p className="text-xs text-indigo-400 mt-1 flex items-center gap-1">
                    <span className="font-semibold">{formData.currency}</span> will be set as your company's base currency
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || loadingCountries}
                className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:shadow-indigo-500/40 hover:scale-[1.01]"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Creating your workspace...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Get Started <ArrowRight className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col border-t border-white/5 pt-5 bg-white/[0.02] rounded-b-xl">
            <Link href="/" className="flex items-center text-sm font-medium text-slate-400 hover:text-indigo-400 transition-colors group">
              <ArrowLeft className="w-4 h-4 mr-1.5 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
