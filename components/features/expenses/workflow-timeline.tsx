import { Approval } from '@/components/mock/data';
import { CheckCircle2, Clock, XCircle, Beaker, ArrowRightCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkflowTimelineProps {
  approvals: Approval[];
  currentStep?: number;
}

export function WorkflowTimeline({ approvals, currentStep }: WorkflowTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Approval Workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative pl-6 border-l-2 border-muted space-y-8 py-2">
          {approvals.map((approval, idx) => {
            const isLast = idx === approvals.length - 1;
            const isApproved = approval.status === 'approved';
            const isRejected = approval.status === 'rejected';
            const isPending = approval.status === 'pending';
            // Custom statuses like 'skipped' or 'auto_approved' if we extend the type
            const isAutoApproved = approval.status === 'auto_approved' as any;
            
            let Icon = Clock;
            let iconColor = 'bg-gray-100 text-gray-500 border-gray-200';
            
            if (isApproved) {
              Icon = CheckCircle2;
              iconColor = 'bg-green-100 text-green-600 border-green-200';
            } else if (isRejected) {
              Icon = XCircle;
              iconColor = 'bg-red-100 text-red-600 border-red-200';
            } else if (isAutoApproved) {
              Icon = ArrowRightCircle;
              iconColor = 'bg-emerald-100 text-emerald-600 border-emerald-200';
            } else if (isPending) {
              Icon = Clock;
              iconColor = 'bg-amber-100 text-amber-600 border-amber-200';
            }

            return (
              <div key={idx} className="relative">
                {/* Timeline node */}
                <div className={`absolute -left-[35px] top-0.5 rounded-full border-2 p-1 bg-background ${iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      {approval.approverName}
                      {isAutoApproved && (
                        <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                          Auto-Approved
                        </span>
                      )}
                    </h4>
                    {approval.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {approval.timestamp.toLocaleString()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Step {approval.step} &bull; {
                      isApproved ? 'Approved' :
                      isRejected ? 'Rejected' :
                      isAutoApproved ? 'Skipped due to rule' : 'Pending Review'
                    }
                  </p>
                  
                  {approval.comment && (
                    <div className="mt-2 text-sm bg-muted/50 p-3 rounded-md text-foreground border border-border/50">
                      {approval.comment}
                    </div>
                  )}
                  
                  {/* Current active step indicator */}
                  {isPending && (
                     <div className="mt-2 flex items-center gap-2 text-xs text-primary font-medium bg-primary/10 w-fit px-2 py-1 rounded">
                       <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                       Current active approver
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
