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
import { Loader2, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';

const categories = ['Travel', 'Meals', 'Supplies', 'Software', 'Training', 'Accommodation', 'Transportation'];

export function ExpenseForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category: 'Travel',
    date: new Date().toISOString().split('T')[0],
    description: '',
    currency: 'USD',
  });

  const [receipt, setReceipt] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

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

  const runOCR = async () => {
    if (!receipt) return;
    setIsScanning(true);
    try {
      const data = await api.scanReceipt(receipt);
      
      setFormData(prev => ({
        ...prev,
        amount: data.amount?.toString() || prev.amount,
        description: data.description || prev.description,
        date: data.date || prev.date,
      }));
      
      setReceiptUrl(data.receiptUrl);

      toast.success('Receipt scanned successfully!');
    } catch (error: any) {
      toast.error('OCR failed: ' + error.message);
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

    try {
      await api.createExpense({
        ...formData,
        amount: parseFloat(formData.amount),
        receiptUrl: receiptUrl || undefined,
        userId: 'temp-user-id', // TODO: Get from real Auth context later
      });
      
      toast.success('Expense submitted successfully!');
      router.push('/dashboard/employee');
    } catch (error: any) {
      toast.error('Submission failed: ' + error.message);
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
                      onClick={() => { setReceipt(null); setReceiptUrl(null); }}
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
                          Click to upload receipt image
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
                  onClick={runOCR}
                  disabled={isScanning}
                  className="w-full"
                  variant="secondary"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Run Real OCR
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
                        <SelectItem value="INR">INR</SelectItem>
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
