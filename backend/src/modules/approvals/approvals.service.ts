import { PrismaClient, ApprovalStatus, ExpenseStatus } from '@prisma/client';
import { RuleEvaluationService } from '../rules/rules.service';
import { EventService } from '../events/events.service';

const prisma = new PrismaClient();
const ruleService = new RuleEvaluationService();
const eventService = new EventService();

export class ApprovalService {
  /**
   * Complex workflow orchestration allowing for sequential and parallel approvals
   * integrated with intelligent business rules.
   */
  async processApproval(expenseId: string, approverId: string, action: 'APPROVE' | 'REJECT', companyId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { 
        approvalSteps: {
          orderBy: { stepOrder: 'asc' }
        }
      }
    });

    if (!expense) throw new Error('Expense not found');
    if (expense.status === 'APPROVED' || expense.status === 'REJECTED') {
      throw new Error('Expense workflow already complete');
    }

    // Find the current active step group (the lowest stepOrder with PENDING status)
    const pendingSteps = expense.approvalSteps.filter(s => s.status === 'PENDING');
    if (pendingSteps.length === 0) throw new Error('No pending approvals at the moment');

    const currentStepOrder = Math.min(...pendingSteps.map(s => s.stepOrder));
    const activeStepGroup = expense.approvalSteps.filter(s => s.stepOrder === currentStepOrder);

    const activeStep = activeStepGroup.find(s => s.approverId === approverId && s.status === 'PENDING');
    if (!activeStep) throw new Error('You are not mapped to the current active approval step');

    const status = action === 'APPROVE' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    // Update current step
    await prisma.approvalStep.update({
      where: { id: activeStep.id },
      data: { status }
    });

    await eventService.logEvent(
      expenseId, 
      action === 'APPROVE' ? 'APPROVED_STEP' : 'REJECTED_STEP', 
      approverId, 
      { step: activeStep.stepOrder, reason: 'Action handled by approver' }
    );

    // STATE MACHINE logic
    if (action === 'REJECT') {
      await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.REJECTED } });
      await eventService.logEvent(expenseId, 'EXPENSE_REJECTED', approverId, { reason: 'Step rejected halting flow' });
      return { status: 'REJECTED' };
    }

    // Check if rule engine overrides the flow to final Approved state AFTER this approval
    const rulesTriggered = await ruleService.evaluateRules(expenseId, companyId);
    if (rulesTriggered.ruleTriggered) {
      await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.APPROVED } });
      await eventService.logEvent(expenseId, 'EXPENSE_APPROVED', null, { reason: rulesTriggered.reason });
      
      // Auto-skip remaining steps
      await prisma.approvalStep.updateMany({
        where: { expenseId, status: 'PENDING' },
        data: { status: ApprovalStatus.SKIPPED }
      });
      return { status: 'APPROVED', rulesTriggered: true };
    }

    // Process normal sequential progression
    // Check if ALL steps in the CURRENT group are approved
    const remainingInGroup = activeStepGroup.filter(s => s.id !== activeStep.id && s.status === 'PENDING');
    
    if (remainingInGroup.length === 0) {
      // Group complete! Check if there are further groups
      const nextGroups = expense.approvalSteps.filter(s => s.stepOrder > currentStepOrder);
      
      if (nextGroups.length === 0) {
        // No more groups, entire workflow approved!
        await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.APPROVED } });
        await eventService.logEvent(expenseId, 'EXPENSE_APPROVED', null, { reason: 'All workflow steps approved' });
        return { status: 'APPROVED' };
      } else {
        // Move to IN_REVIEW for the next group
        await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.IN_REVIEW } });
        return { status: 'IN_REVIEW', nextStepOrder: currentStepOrder + 1 };
      }
    }

    // Still waiting for others in the parallel group
    return { status: 'IN_REVIEW', message: 'Waiting for parallel approvers in this step' };
  }

  /**
   * Performance-optimized query for the Manager Dashboard.
   * Finds all expenses where the given approverId is in the CURRENT active step group.
   */
  async getPendingApprovals(approverId: string) {
    // 1. Find all PENDING approval steps for this user
    const pendingSteps = await prisma.approvalStep.findMany({
      where: { 
        approverId,
        status: 'PENDING'
      },
      include: {
        expense: {
          include: { 
            user: true, 
            approvalSteps: true 
          }
        }
      }
    });

    // 2. Filter to only those where this step is the CURRENT active step (lowest order)
    const trulyActive = pendingSteps.filter(step => {
      const allStepsForExpense = step.expense.approvalSteps;
      const minPendingOrder = Math.min(
        ...allStepsForExpense
          .filter(s => s.status === 'PENDING')
          .map(s => s.stepOrder)
      );
      return step.stepOrder === minPendingOrder;
    });

    return trulyActive.map(s => ({
      ...s.expense,
      currentStepId: s.id
    }));
  }
}


