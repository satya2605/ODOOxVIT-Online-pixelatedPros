import { PrismaClient, RuleType, Expense, Role } from '@prisma/client';

const prisma = new PrismaClient();

export class RuleEvaluationService {
  /**
   * Evaluate rules for a given expense to determine if it can auto-approve
   * or requires specific role overrides (e.g., CFO approval).
   */
  async evaluateRules(expenseId: string, companyId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: { 
        approvalSteps: {
          include: { approver: true }
        } 
      }
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
            metadata: { 
              ruleId: rule.id, 
              type: rule.type, 
              description: `Workflow overridden by ${rule.type} rule` 
            }
          }
        });

        return {
          ruleTriggered: true,
          reason: `Auto-resolved by ${rule.type} rule`,
          rule
        };
      }
    }

    return { ruleTriggered: false };
  }

  private checkCondition(rule: any, expense: any): boolean {
    const condition = rule.conditionJson as any;
    
    switch (rule.type) {
      case 'PERCENTAGE':
        return this.evaluatePercentageRule(condition, expense);
      case 'ROLE_BASED':
        return this.evaluateRoleRule(condition, expense);
      case 'HYBRID':
        // Hybrid often means (Percentage OR Role) or (Threshold AND Percentage)
        // For simplicity: Trigger if ANY sub-condition matches
        return this.evaluatePercentageRule(condition, expense) || 
               this.evaluateRoleRule(condition, expense) ||
               this.evaluateThresholdRule(condition, expense);
      default:
        return this.evaluateThresholdRule(condition, expense);
    }
  }

  private evaluatePercentageRule(condition: any, expense: any): boolean {
    if (!condition.percentage) return false;
    const totalSteps = expense.approvalSteps.length;
    if (totalSteps === 0) return false;

    const approvedSteps = expense.approvalSteps.filter((s:any) => s.status === 'APPROVED').length;
    const currentPercentage = (approvedSteps / totalSteps) * 100;
    return currentPercentage >= condition.percentage;
  }

  private evaluateRoleRule(condition: any, expense: any): boolean {
    if (!condition.requiredRole) return false;
    // Check if ANY of the approved steps were done by a user with the required role
    return expense.approvalSteps.some(
      (s: any) => s.status === 'APPROVED' && s.approver.role === condition.requiredRole
    );
  }

  private evaluateThresholdRule(condition: any, expense: any): boolean {
    if (!condition.maxAmount) return false;
    // Auto-approve if amount is below threshold (assumed in company base currency)
    return expense.amount <= condition.maxAmount;
  }
}

