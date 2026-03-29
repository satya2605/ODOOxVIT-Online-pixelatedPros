// Mock data generators for ERMS

export type UserRole = 'employee' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  managerId?: string;
  avatar?: string;
}

export interface Approval {
  approverId: string;
  step: number;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
  timestamp: Date;
  approverName?: string;
}

export interface Expense {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  currency: string;
  category: string;
  date: Date;
  description: string;
  receiptUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvals: Approval[];
  createdAt: Date;
}

export interface ApprovalRule {
  id: string;
  name: string;
  conditions: Array<{
    type: 'amount' | 'category' | 'approver_percentage';
    operator: '>' | '<' | '==' | '<=' | '>=';
    value: any;
  }>;
  action: 'require_approver' | 'skip_step' | 'auto_approve';
  metadata: {
    approverId?: string;
    percentage?: number;
  };
  enabled: boolean;
}

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  requiredRole: 'manager' | 'finance' | 'director';
  name: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-emp-1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    role: 'employee',
    department: 'Engineering',
    managerId: 'user-mgr-1',
    avatar: 'SC',
  },
  {
    id: 'user-emp-2',
    name: 'Michael Johnson',
    email: 'michael.johnson@company.com',
    role: 'employee',
    department: 'Sales',
    managerId: 'user-mgr-2',
    avatar: 'MJ',
  },
  {
    id: 'user-emp-3',
    name: 'Emma Davis',
    email: 'emma.davis@company.com',
    role: 'employee',
    department: 'Marketing',
    managerId: 'user-mgr-1',
    avatar: 'ED',
  },
  {
    id: 'user-emp-4',
    name: 'James Wilson',
    email: 'james.wilson@company.com',
    role: 'employee',
    department: 'Engineering',
    managerId: 'user-mgr-1',
    avatar: 'JW',
  },
  {
    id: 'user-mgr-1',
    name: 'Alice Roberts',
    email: 'alice.roberts@company.com',
    role: 'manager',
    department: 'Engineering',
    avatar: 'AR',
  },
  {
    id: 'user-mgr-2',
    name: 'David Brown',
    email: 'david.brown@company.com',
    role: 'manager',
    department: 'Sales',
    avatar: 'DB',
  },
  {
    id: 'user-admin-1',
    name: 'Robert Taylor',
    email: 'robert.taylor@company.com',
    role: 'admin',
    department: 'Finance',
    avatar: 'RT',
  },
];

// Mock Expenses
const expenseCategories = ['Travel', 'Meals', 'Supplies', 'Software', 'Training', 'Accommodation', 'Transportation'];

export const mockExpenses: Expense[] = [
  {
    id: 'exp-001',
    employeeId: 'user-emp-1',
    employeeName: 'Sarah Chen',
    amount: 1250.50,
    currency: 'USD',
    category: 'Travel',
    date: new Date(2024, 0, 15),
    description: 'Client meeting in New York - Flight',
    status: 'approved',
    approvals: [
      {
        approverId: 'user-mgr-1',
        approverName: 'Alice Roberts',
        step: 1,
        status: 'approved',
        comment: 'Approved - business trip justified',
        timestamp: new Date(2024, 0, 16),
      },
      {
        approverId: 'user-admin-1',
        approverName: 'Robert Taylor',
        step: 2,
        status: 'approved',
        comment: 'Budget approved',
        timestamp: new Date(2024, 0, 17),
      },
    ],
    createdAt: new Date(2024, 0, 15),
  },
  {
    id: 'exp-002',
    employeeId: 'user-emp-1',
    employeeName: 'Sarah Chen',
    amount: 3500.0,
    currency: 'USD',
    category: 'Training',
    date: new Date(2024, 1, 5),
    description: 'React Advanced Course - Online',
    status: 'pending',
    approvals: [
      {
        approverId: 'user-mgr-1',
        approverName: 'Alice Roberts',
        step: 1,
        status: 'pending',
        timestamp: new Date(2024, 1, 5),
      },
    ],
    createdAt: new Date(2024, 1, 5),
  },
  {
    id: 'exp-003',
    employeeId: 'user-emp-2',
    employeeName: 'Michael Johnson',
    amount: 285.75,
    currency: 'USD',
    category: 'Meals',
    date: new Date(2024, 1, 10),
    description: 'Team lunch - Client entertainment',
    status: 'approved',
    approvals: [
      {
        approverId: 'user-mgr-2',
        approverName: 'David Brown',
        step: 1,
        status: 'approved',
        comment: 'Client entertainment - approved',
        timestamp: new Date(2024, 1, 11),
      },
    ],
    createdAt: new Date(2024, 1, 10),
  },
  {
    id: 'exp-004',
    employeeId: 'user-emp-3',
    employeeName: 'Emma Davis',
    amount: 150.0,
    currency: 'USD',
    category: 'Supplies',
    date: new Date(2024, 1, 12),
    description: 'Office supplies - Markers and flipcharts',
    status: 'rejected',
    approvals: [
      {
        approverId: 'user-mgr-1',
        approverName: 'Alice Roberts',
        step: 1,
        status: 'rejected',
        comment: 'Use existing office stock',
        timestamp: new Date(2024, 1, 12),
      },
    ],
    createdAt: new Date(2024, 1, 12),
  },
  {
    id: 'exp-005',
    employeeId: 'user-emp-4',
    employeeName: 'James Wilson',
    amount: 899.99,
    currency: 'USD',
    category: 'Software',
    date: new Date(2024, 1, 14),
    description: 'Annual software license - Development tool',
    status: 'pending',
    approvals: [
      {
        approverId: 'user-mgr-1',
        approverName: 'Alice Roberts',
        step: 1,
        status: 'approved',
        comment: 'Engineering essential',
        timestamp: new Date(2024, 1, 14),
      },
      {
        approverId: 'user-admin-1',
        approverName: 'Robert Taylor',
        step: 2,
        status: 'pending',
        timestamp: new Date(2024, 1, 14),
      },
    ],
    createdAt: new Date(2024, 1, 14),
  },
  {
    id: 'exp-006',
    employeeId: 'user-emp-1',
    employeeName: 'Sarah Chen',
    amount: 425.0,
    currency: 'USD',
    category: 'Accommodation',
    date: new Date(2024, 1, 18),
    description: 'Hotel - Conference attendance',
    status: 'pending',
    approvals: [
      {
        approverId: 'user-mgr-1',
        approverName: 'Alice Roberts',
        step: 1,
        status: 'pending',
        timestamp: new Date(2024, 1, 18),
      },
    ],
    createdAt: new Date(2024, 1, 18),
  },
  {
    id: 'exp-007',
    employeeId: 'user-emp-2',
    employeeName: 'Michael Johnson',
    amount: 7500.0,
    currency: 'USD',
    category: 'Travel',
    date: new Date(2024, 1, 20),
    description: 'International conference - 3 day trip to London',
    status: 'pending',
    approvals: [
      {
        approverId: 'user-mgr-2',
        approverName: 'David Brown',
        step: 1,
        status: 'pending',
        timestamp: new Date(2024, 1, 20),
      },
    ],
    createdAt: new Date(2024, 1, 20),
  },
];

// Mock Approval Rules
export const mockApprovalRules: ApprovalRule[] = [
  {
    id: 'rule-001',
    name: 'High Amount Approval',
    conditions: [
      {
        type: 'amount',
        operator: '>',
        value: 5000,
      },
    ],
    action: 'require_approver',
    metadata: {
      approverId: 'user-admin-1',
    },
    enabled: true,
  },
  {
    id: 'rule-002',
    name: 'Travel Category Threshold',
    conditions: [
      {
        type: 'category',
        operator: '==',
        value: 'Travel',
      },
      {
        type: 'amount',
        operator: '>',
        value: 2000,
      },
    ],
    action: 'require_approver',
    metadata: {
      approverId: 'user-admin-1',
    },
    enabled: true,
  },
  {
    id: 'rule-003',
    name: 'Training Approval',
    conditions: [
      {
        type: 'category',
        operator: '==',
        value: 'Training',
      },
      {
        type: 'amount',
        operator: '>',
        value: 1000,
      },
    ],
    action: 'require_approver',
    metadata: {
      percentage: 60,
    },
    enabled: true,
  },
];

// Mock Workflow Steps
export const mockWorkflowSteps: WorkflowStep[] = [
  {
    id: 'step-1',
    stepNumber: 1,
    requiredRole: 'manager',
    name: 'Manager Review',
  },
  {
    id: 'step-2',
    stepNumber: 2,
    requiredRole: 'finance',
    name: 'Finance Review',
  },
  {
    id: 'step-3',
    stepNumber: 3,
    requiredRole: 'director',
    name: 'Director Approval',
  },
];

export const getExpensesByEmployee = (employeeId: string): Expense[] => {
  return mockExpenses.filter(e => e.employeeId === employeeId);
};

export const getExpensesByManager = (managerId: string): Expense[] => {
  const managedEmployees = mockUsers
    .filter(u => u.managerId === managerId)
    .map(u => u.id);
  return mockExpenses.filter(e => managedEmployees.includes(e.employeeId));
};

export const getPendingExpenses = (): Expense[] => {
  return mockExpenses.filter(e => e.status === 'pending');
};
