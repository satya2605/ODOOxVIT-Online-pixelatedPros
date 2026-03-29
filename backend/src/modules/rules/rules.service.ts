import { PrismaClient, RuleType, Expense } from '@prisma/client';

const prisma = new PrismaClient();

export class RuleEvaluationService {
  /**
   * Evaluate rules for a given expense to determine if it can auto-approve
   * or requires specific role overrides (e.g., CFO approval).
   */
  async evaluateRules(expenseId: string, companyId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { approvalSteps: true }
    });

    if (!expense) throw new Error('Expense not found');

    const rules = await prisma.rule.findMany({
      where: { companyId },
      orderBy: { priority: 'desc' }
    });

    for (const rule of rules) {
      const isTriggered = this.checkCondition(rule, expense);
      
      if (isTriggered) {
        // Track the rule trigger event
        await prisma.event.create({
          data: {
            expenseId,
            type: 'RULE_TRIGGERED',
            metadata: { ruleId: rule.id, type: rule.type, description: 'Workflow overridden by rule engine' }
          }
        });

        return {
          ruleTriggered: true,
          reason: `Auto-resolved by ${rule.type} rule: ${rule.id}`,
          rule
        };
      }
    }

    return { ruleTriggered: false };
  }

  private checkCondition(rule: any, expense: any): boolean {
    const condition = rule.conditionJson as any;
    
    // Example: Percentage of steps approved
    if (rule.type === 'PERCENTAGE' && condition.percentage) {
      const totalSteps = expense.approvalSteps.length;
      if (totalSteps === 0) return false;

      const approvedSteps = expense.approvalSteps.filter((s:any) => s.status === 'APPROVED').length;
      const currentPercentage = (approvedSteps / totalSteps) * 100;

      return currentPercentage >= condition.percentage;
    }

    // Example: Overriding role trigger like "If CFO approves, finish workflow"
    if (rule.type === 'ROLE_BASED' && condition.requiredRole) {
       // logic checking if CFO has approved
       // We would fetch the role of approvers who marked 'APPROVED'
       // Just mapping out the pseudo-logic as per request
       return false; 
    }

    return false;
  }
}
