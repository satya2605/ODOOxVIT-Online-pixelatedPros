'use client';

import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { Expense, User, ApprovalRule, UserRole, Approval, WorkflowStep } from './data';
import { mockExpenses, mockApprovalRules, mockWorkflowSteps, mockUsers } from './data';

export interface AppState {
  currentUserRole: UserRole;
  currentUserId: string;
  users: User[];
  expenses: Expense[];
  approvalRules: ApprovalRule[];
  workflowSteps: WorkflowStep[];
  loading: boolean;
  toast?: {
    message: string;
    type: 'success' | 'error' | 'info';
  };
}

export type AppAction =
  | { type: 'SET_CURRENT_USER'; payload: { userId: string; role: UserRole } }
  | { type: 'SUBMIT_EXPENSE'; payload: Expense }
  | { type: 'APPROVE_EXPENSE'; payload: { expenseId: string; approverId: string; comment?: string } }
  | { type: 'REJECT_EXPENSE'; payload: { expenseId: string; approverId: string; comment: string } }
  | { type: 'UPDATE_RULE'; payload: ApprovalRule }
  | { type: 'CREATE_RULE'; payload: ApprovalRule }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'UPDATE_WORKFLOW_STEPS'; payload: WorkflowStep[] }
  | { type: 'CREATE_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SHOW_TOAST'; payload: { message: string; type: 'success' | 'error' | 'info' } }
  | { type: 'CLEAR_TOAST' };

const initialState: AppState = {
  currentUserRole: 'employee',
  currentUserId: 'user-emp-1',
  users: mockUsers,
  expenses: mockExpenses,
  approvalRules: mockApprovalRules,
  workflowSteps: mockWorkflowSteps,
  loading: false,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_CURRENT_USER':
      return {
        ...state,
        currentUserRole: action.payload.role,
        currentUserId: action.payload.userId,
      };

    case 'SUBMIT_EXPENSE': {
      const newExpense = {
        ...action.payload,
        createdAt: new Date(),
        approvals: [
          {
            approverId: state.users.find(u => u.id === state.users.find(user => state.currentUserId === user.id)?.managerId)?.id || 'user-mgr-1',
            approverName: state.users.find(u => u.id === state.users.find(user => state.currentUserId === user.id)?.managerId)?.name || 'Manager',
            step: 1,
            status: 'pending' as const,
            timestamp: new Date(),
          },
        ],
      };
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        toast: { message: 'Expense submitted successfully', type: 'success' },
      };
    }

    case 'APPROVE_EXPENSE': {
      const updatedExpenses = state.expenses.map(exp => {
        if (exp.id === action.payload.expenseId) {
          const approvals = exp.approvals.map((app, idx) => {
            if (app.step === 1 && app.status === 'pending') {
              return {
                ...app,
                status: 'approved' as const,
                comment: action.payload.comment,
                timestamp: new Date(),
              };
            }
            return app;
          });

          // Check if there are more approval steps needed
          const hasMoreSteps = state.workflowSteps.some(step => step.stepNumber > 1);
          let newStatus: 'pending' | 'approved' | 'rejected' = 'pending';

          if (hasMoreSteps && approvals[0]?.step === 1) {
            // Add next step
            approvals.push({
              approverId: 'user-admin-1',
              approverName: 'Finance',
              step: 2,
              status: 'pending',
              timestamp: new Date(),
            });
          } else if (!hasMoreSteps) {
            newStatus = 'approved';
          }

          return {
            ...exp,
            status: newStatus,
            approvals,
          };
        }
        return exp;
      });

      return {
        ...state,
        expenses: updatedExpenses,
        toast: { message: 'Expense approved', type: 'success' },
      };
    }

    case 'REJECT_EXPENSE': {
      const updatedExpenses = state.expenses.map(exp => {
        if (exp.id === action.payload.expenseId) {
          return {
            ...exp,
            status: 'rejected' as const,
            approvals: exp.approvals.map(app => ({
              ...app,
              status: 'rejected' as const,
              comment: action.payload.comment,
              timestamp: new Date(),
            })),
          };
        }
        return exp;
      });

      return {
        ...state,
        expenses: updatedExpenses,
        toast: { message: 'Expense rejected', type: 'success' },
      };
    }

    case 'UPDATE_RULE': {
      return {
        ...state,
        approvalRules: state.approvalRules.map(rule => (rule.id === action.payload.id ? action.payload : rule)),
        toast: { message: 'Rule updated successfully', type: 'success' },
      };
    }

    case 'CREATE_RULE': {
      return {
        ...state,
        approvalRules: [...state.approvalRules, action.payload],
        toast: { message: 'Rule created successfully', type: 'success' },
      };
    }

    case 'DELETE_RULE': {
      return {
        ...state,
        approvalRules: state.approvalRules.filter(rule => rule.id !== action.payload),
        toast: { message: 'Rule deleted successfully', type: 'success' },
      };
    }

    case 'UPDATE_WORKFLOW_STEPS': {
      return {
        ...state,
        workflowSteps: action.payload,
        toast: { message: 'Workflow updated successfully', type: 'success' },
      };
    }

    case 'CREATE_USER': {
      return {
        ...state,
        users: [...state.users, action.payload],
        toast: { message: 'User created successfully', type: 'success' },
      };
    }

    case 'UPDATE_USER': {
      return {
        ...state,
        users: state.users.map(user => (user.id === action.payload.id ? action.payload : user)),
        toast: { message: 'User updated successfully', type: 'success' },
      };
    }

    case 'DELETE_USER': {
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
        toast: { message: 'User deleted successfully', type: 'success' },
      };
    }

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };

    case 'SHOW_TOAST':
      return {
        ...state,
        toast: action.payload,
      };

    case 'CLEAR_TOAST':
      return {
        ...state,
        toast: undefined,
      };

    default:
      return state;
  }
}

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  submitExpense: (expense: Expense) => Promise<void>;
  approveExpense: (expenseId: string, approverId: string, comment?: string) => Promise<void>;
  rejectExpense: (expenseId: string, approverId: string, comment: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const submitExpense = useCallback(async (expense: Expense) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'SUBMIT_EXPENSE', payload: expense });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const approveExpense = useCallback(async (expenseId: string, approverId: string, comment?: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'APPROVE_EXPENSE', payload: { expenseId, approverId, comment } });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const rejectExpense = useCallback(async (expenseId: string, approverId: string, comment: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 500));
    dispatch({ type: 'REJECT_EXPENSE', payload: { expenseId, approverId, comment } });
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const value: AppContextType = {
    state,
    dispatch,
    submitExpense,
    approveExpense,
    rejectExpense,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
