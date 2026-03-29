import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types based on Prisma schema/Backend responses
export interface Expense {
  id: string;
  amount: number;
  currency: string;
  category: string;
  status: string;
  description: string;
  date: string;
  receiptUrl?: string;
  userId: string;
  createdAt: string;
}

export const api = {
  // --- Expenses ---
  getExpenses: async () => {
    const response = await apiClient.get<Expense[]>('/expenses');
    return response.data;
  },

  getExpenseById: async (id: string) => {
    const response = await apiClient.get<Expense>(`/expenses/${id}`);
    return response.data;
  },


  createExpense: async (data: Partial<Expense>) => {
    const response = await apiClient.post<Expense>('/expenses', data);
    return response.data;
  },

  // --- OCR ---
  scanReceipt: async (base64: string) => {
    const response = await apiClient.post('/ocr/scan', { receiptBase64: base64 });
    return response.data;
  },

  // --- Approvals ---
  getPendingApprovals: async (approverId: string) => {
    const response = await apiClient.get(`/approvals/pending?approverId=${approverId}`);
    return response.data;
  },


  approveExpense: async (expenseId: string, approverId: string) => {
    const response = await apiClient.post(`/approvals/${expenseId}/approve`, { approverId });
    return response.data;
  },

  rejectExpense: async (expenseId: string, approverId: string, reason: string) => {
    const response = await apiClient.post(`/approvals/${expenseId}/reject`, { approverId, reason });
    return response.data;
  },

  // --- Rules ---
  getRules: async () => {
    const response = await apiClient.get('/rules');
    return response.data;
  },

  createRule: async (rule: any) => {
    const response = await apiClient.post('/rules', rule);
    return response.data;
  }
};

export default api;
