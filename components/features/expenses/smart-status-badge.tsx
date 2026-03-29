import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, Clock, XCircle, AlertCircle, FileText, Bot } from 'lucide-react';

export type ExpenseStatus = 'draft' | 'submitted' | 'pending' | 'in_review' | 'approved' | 'auto_approved' | 'rejected' | 'escalated';

interface SmartStatusBadgeProps {
  status: ExpenseStatus | string;
  className?: string;
  stepInfo?: string; // e.g., "Step 1 of 2"
}

export function SmartStatusBadge({ status, className, stepInfo }: SmartStatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'draft':
        return { label: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: FileText, tooltip: 'Not yet submitted' };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2, tooltip: 'Waiting for initial review' };
      case 'pending':
      case 'in_review':
        return { label: 'In Review', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock, tooltip: stepInfo || 'Currently under review' };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2, tooltip: 'Fully approved' };
      case 'auto_approved':
        return { label: 'Auto Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: Bot, tooltip: 'Automatically approved by rule engine' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle, tooltip: 'Request was denied' };
      case 'escalated':
        return { label: 'Escalated', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: AlertCircle, tooltip: 'Raised to higher authority' };
      default:
        return { label: s, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: Clock, tooltip: 'Unknown status' };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={`flex items-center gap-1.5 px-2.5 py-0.5 whitespace-nowrap ${config.color} ${className}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{config.label}</span>
            {stepInfo && status.toLowerCase() === 'pending' && <span className="ml-1 text-xs opacity-70">({stepInfo})</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
