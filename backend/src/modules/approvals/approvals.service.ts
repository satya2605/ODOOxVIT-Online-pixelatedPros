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
      include: { approvalSteps: true }
    });

    if (!expense) throw new Error('Expense not found');
    if (expense.status === 'APPROVED' || expense.status === 'REJECTED') {
      throw new Error('Expense workflow already complete');
    }

    const currentStepIndex = expense.approvalSteps.findIndex(s => s.status === 'PENDING');
    if (currentStepIndex === -1) throw new Error('No pending approvals at the moment');

    const activeStepGroup = expense.approvalSteps.filter(
      s => s.stepOrder === expense.approvalSteps[currentStepIndex].stepOrder
    );

    const activeStep = activeStepGroup.find(s => s.approverId === approverId);
    if (!activeStep) throw new Error('You are not mapped to current active steps');

    const status = action === 'APPROVE' ? ApprovalStatus.APPROVED : ApprovalStatus.REJECTED;

    await prisma.approvalStep.update({
      where: { id: activeStep.id },
      data: { status }
    });

    await eventService.logEvent(
      expenseId, 
      action === 'APPROVE' ? 'APPROVED_STEP' : 'REJECTED_STEP', 
      approverId, 
      { step: activeStep.stepOrder, reason: 'Approved via system' }
    );

    // STATE MACHINE logic
    if (action === 'REJECTED') {
      await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.REJECTED } });
      await eventService.logEvent(expenseId, 'EXPENSE_REJECTED', approverId, { reason: 'Step rejected halting flow' });
      return { status: 'REJECTED' };
    }

    // Checking if rule engine overrides the flow to final Approved state
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
    const pendingInCurrentStepOrder = activeStepGroup.some(s => s.id !== activeStep.id && s.status === 'PENDING');
    
    // If all approvers at current step approved, wait for next step or conclude
    if (!pendingInCurrentStepOrder) {
      const remainingPending = expense.approvalSteps.some(s => s.id !== activeStep.id && s.status === 'PENDING');
      if (!remainingPending) {
        await prisma.expense.update({ where: { id: expenseId }, data: { status: ExpenseStatus.APPROVED } });
        await eventService.logEvent(expenseId, 'EXPENSE_APPROVED', null, { reason: 'All steps complete' });
        return { status: 'APPROVED' };
      }
    }

    return { status: 'IN_REVIEW', nextStep: 'Awaiting other approvers' };
  }
}
