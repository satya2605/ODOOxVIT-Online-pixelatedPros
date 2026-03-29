'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useApp } from '@/components/mock/state';
import { Expense } from '@/components/mock/data';
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

const categories = ['Travel', 'Meals', 'Supplies', 'Software', 'Training', 'Accommodation', 'Transportation'];

interface ReceiptData {
  amount?: number;
  description?: string;
}

export function ExpenseForm() {
  const router = useRouter();
  const { state, dispatch, submitExpense } = useApp();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData>({});

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    description: '',
    currency: 'USD',
  });

  const [receipt, setReceipt] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        setReceipt(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateOCR = async () => {
    setIsScanning(true);
    try {
      // Call real backend OCR service
      const response = await fetch('http://localhost:5000/api/ocr/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptBase64: receipt }),
      });

      if (!response.ok) throw new Error('OCR service failed');

      const data = await response.json();

      setReceiptData({ amount: data.amount, description: data.description });
      setFormData(prev => ({
        ...prev,
        amount: data.amount?.toString() || prev.amount,
        description: data.description || prev.description,
        date: data.date || prev.date,
      }));

      toast.success('Receipt scanned! Data populated from server.');
    } catch (error) {
      // Fallback to local mock if backend is unreachable
      const fallbackData = {
        amount: Math.round(Math.random() * 800 + 100) + 0.99,
        description: 'Receipt scan - Business expense item',
      };
      setReceiptData(fallbackData);
      setFormData(prev => ({
        ...prev,
        amount: fallbackData.amount.toString(),
        description: fallbackData.description,
      }));
      toast.warning('Backend OCR unavailable — using local mock.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.category || !formData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      employeeId: state.currentUserId,
      employeeName: state.users.find(u => u.id === state.currentUserId)?.name || 'Employee',
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      category: formData.category,
      date: new Date(formData.date),
      description: formData.description,
      receiptUrl: receipt || undefined,
      status: 'pending',
      approvals: [],
      createdAt: new Date(),
    };

    try {
      await submitExpense(newExpense);
      toast.success('Expense submitted successfully!');
      setTimeout(() => {
        router.push('/dashboard/employee/expenses');
      }, 1000);
    } catch (error) {
      toast.error('Failed to submit expense');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Receipt Preview */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Receipt</CardTitle>
              <CardDescription>Upload or scan a receipt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                {receipt ? (
                  <div className="space-y-4">
                    <img src={receipt} alt="Receipt" className="w-full h-auto rounded" />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setReceipt(null)}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Label
                      htmlFor="receipt-upload"
                      className="cursor-pointer inline-block w-full"
                    >
                      <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-2">
                          Drag and drop your receipt here or click to upload
                        </p>
                        <Input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleReceiptUpload}
                          className="hidden"
                        />
                      </div>
                    </Label>
                  </div>
                )}
              </div>

              {receipt && (
                <Button
                  type="button"
                  onClick={simulateOCR}
                  disabled={isScanning}
                  className="w-full"
                  variant="secondary"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Scan Receipt (OCR)
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Form Fields */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Expense Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                    />
                    <Select value={formData.currency} onValueChange={v => handleSelectChange('currency', v)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={v => handleSelectChange('category', v)}>
                    <SelectTrigger id="category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the expense..."
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Expense'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/dashboard/employee')}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
