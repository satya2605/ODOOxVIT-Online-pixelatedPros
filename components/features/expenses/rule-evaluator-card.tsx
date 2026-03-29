import { ApprovalRule, Expense } from '@/components/mock/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RuleEvaluatorCardProps {
  expense: Expense;
  activeRules: ApprovalRule[];
  isPendingPreview?: boolean;
}

export function RuleEvaluatorCard({ expense, activeRules = [], isPendingPreview = false }: RuleEvaluatorCardProps) {
  if (activeRules.length === 0 && !isPendingPreview) return null;

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
          <ShieldCheck className="w-4 h-4" />
          Approval Logic / Rules Applied
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeRules.map((rule, idx) => {
            const isTriggered = true; // In full app, evaluate rule logic here
            return (
              <div key={idx} className="flex flex-col gap-1 p-3 bg-background rounded-md border text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{rule.name}</span>
                  {isTriggered ? (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold">
                      <CheckCircle2 className="w-3 h-3" /> Triggered
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-xs">Evaluated</span>
                  )}
                </div>
                <div className="text-muted-foreground text-xs">
                  {rule.conditions.map(c => `[${c.type} ${c.operator} ${c.value}]`).join(' AND ')}
                  {' -> '}
                  <span className="font-semibold">{rule.action.replace('_', ' ')}</span>
                </div>
              </div>
            );
          })}
          
          {isPendingPreview && (
             <div className="mt-3 p-3 bg-blue-50 text-blue-800 rounded-md border border-blue-200 text-sm flex items-start gap-2">
               <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
               <div>
                 <strong>Action Impact Preview:</strong>
                 <p className="mt-1 text-xs text-blue-700/80">
                   If you approve → Expense will move to Finance Review.
                   Rule &quot;High Amount Approval&quot; enforces this step.
                 </p>
               </div>
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
