import { cn } from '@/lib/utils';
import { LeadStatus, LeadPriority } from '@/types/database';

interface StatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

const statusStyles: Record<LeadStatus, string> = {
  New: 'bg-blue-100 text-blue-800 border-blue-200',
  Contacted: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  Proposal: 'bg-amber-100 text-amber-800 border-amber-200',
  Negotiation: 'bg-orange-100 text-orange-800 border-orange-200',
  Won: 'bg-green-100 text-green-800 border-green-200',
  Lost: 'bg-red-100 text-red-800 border-red-200',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        statusStyles[status],
        className
      )}
    >
      {status}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: LeadPriority;
  className?: string;
}

const priorityStyles: Record<LeadPriority, string> = {
  Low: 'bg-slate-100 text-slate-700 border-slate-200',
  Medium: 'bg-blue-100 text-blue-800 border-blue-200',
  High: 'bg-amber-100 text-amber-800 border-amber-200',
  Urgent: 'bg-red-100 text-red-800 border-red-200',
};

const priorityDots: Record<LeadPriority, string> = {
  Low: 'bg-slate-400',
  Medium: 'bg-blue-500',
  High: 'bg-amber-500',
  Urgent: 'bg-red-500 animate-pulse',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border',
        priorityStyles[priority],
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', priorityDots[priority])} />
      {priority}
    </span>
  );
}
