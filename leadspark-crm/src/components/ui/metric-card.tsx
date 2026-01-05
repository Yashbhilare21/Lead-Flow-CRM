import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconClassName?: string;
}

export function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'relative p-6 rounded-xl bg-card border shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 overflow-hidden group',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-display font-bold text-foreground tracking-tight">
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'mt-2 text-sm font-medium flex items-center gap-1',
                trend.isPositive ? 'text-success' : 'text-destructive'
              )}
            >
              <span className={cn(
                'inline-flex items-center justify-center w-5 h-5 rounded-full text-xs',
                trend.isPositive ? 'bg-success/10' : 'bg-destructive/10'
              )}>
                {trend.isPositive ? '↑' : '↓'}
              </span>
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </p>
          )}
        </div>
        <div
          className={cn(
            'p-3 rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110',
            iconClassName
          )}
        >
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
    </div>
  );
}