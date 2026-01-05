import { useMemo } from 'react';
import { Lead } from '@/types/database';
import { isToday, isBefore, startOfDay, parseISO } from 'date-fns';

export type OverdueStatus = 'overdue' | 'due-today' | 'upcoming' | null;

export function getOverdueStatus(lead: Lead): OverdueStatus {
  // Skip closed leads
  if (lead.status === 'Won' || lead.status === 'Lost') {
    return null;
  }

  if (!lead.nextFollowUpDate) {
    return null;
  }

  const followUpDate = parseISO(lead.nextFollowUpDate);
  const today = startOfDay(new Date());

  if (isToday(followUpDate)) {
    return 'due-today';
  }

  if (isBefore(followUpDate, today)) {
    return 'overdue';
  }

  return 'upcoming';
}

export function useOverdueLeads(leads: Lead[]) {
  return useMemo(() => {
    const overdueCount = leads.filter(lead => getOverdueStatus(lead) === 'overdue').length;
    const dueTodayCount = leads.filter(lead => getOverdueStatus(lead) === 'due-today').length;
    
    return {
      overdueCount,
      dueTodayCount,
      totalUrgent: overdueCount + dueTodayCount,
    };
  }, [leads]);
}
