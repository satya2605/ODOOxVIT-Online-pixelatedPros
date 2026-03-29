import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─────────────────────────────────────────────────────────
// Types based on Prisma schema / Backend responses
// ─────────────────────────────────────────────────────────

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

export interface User {
  id: string;
  name: string;
  email: string;
  role: string; // 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'CFO'
  managerId?: string | null;
  companyId: string;
  createdAt?: string;
  manager?: { id: string; name: string } | null;
  tempPassword?: string; // Only returned when newly created
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
  currency: string;
  managerId?: string | null;
}

export const api = {
  // ─── Auth ──────────────────────────────────────────────
  signup: async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    country: string;
    currency: string;
    companyName: string;
  }) => {
    const res = await apiClient.post<{ user: AuthUser }>('/auth/signup', data);
    return res.data;
  },

  login: async (email: string, password: string) => {
    const res = await apiClient.post<{ user: AuthUser }>('/auth/login', { email, password });
    return res.data;
  },

  // ─── Users ─────────────────────────────────────────────
  getUsers: async (companyId?: string) => {
    const params = companyId ? `?companyId=${companyId}` : '';
    const res = await apiClient.get<User[]>(`/users${params}`);
    return res.data;
  },

  createUser: async (data: {
    name: string;
    email: string;
    role: string;
    managerId?: string;
    companyId: string;
  }) => {
    const res = await apiClient.post<User>('/users', data);
    return res.data;
  },

  updateUser: async (id: string, data: Partial<Pick<User, 'name' | 'email' | 'role' | 'managerId'>>) => {
    const res = await apiClient.put<User>(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id: string) => {
    await apiClient.delete(`/users/${id}`);
  },

  sendPassword: async (userId: string) => {
    const res = await apiClient.post<{ message: string; tempPassword: string }>(
      `/users/${userId}/send-password`
    );
    return res.data;
  },

  // ─── Expenses ──────────────────────────────────────────
  getExpenses: async (userId?: string) => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await apiClient.get<Expense[]>(`/expenses${params}`);
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

  // ─── OCR ───────────────────────────────────────────────
  scanReceipt: async (base64: string) => {
    const response = await apiClient.post('/ocr/scan', { receiptBase64: base64 });
    return response.data;
  },

  // ─── Approvals ─────────────────────────────────────────
  getPendingApprovals: async (approverId: string) => {
    const response = await apiClient.get(`/approvals/pending?approverId=${approverId}`);
    return response.data;
  },

  approveExpense: async (expenseId: string, approverId: string, comments?: string) => {
    const response = await apiClient.post(`/approvals/${expenseId}/approve`, { approverId, comments });
    return response.data;
  },

  rejectExpense: async (expenseId: string, approverId: string, reason: string) => {
    const response = await apiClient.post(`/approvals/${expenseId}/reject`, { approverId, reason });
    return response.data;
  },

  // ─── Rules ─────────────────────────────────────────────
  getRules: async () => {
    const response = await apiClient.get('/rules');
    return response.data;
  },

  createRule: async (rule: any) => {
    const response = await apiClient.post('/rules', rule);
    return response.data;
  },

  deleteRule: async (id: string) => {
    await apiClient.delete(`/rules/${id}`);
  },
};

export default api;
